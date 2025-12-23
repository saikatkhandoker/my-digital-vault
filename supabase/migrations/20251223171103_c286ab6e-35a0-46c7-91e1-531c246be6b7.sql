-- Add parent_id column to video_categories for subcategories
ALTER TABLE public.video_categories 
ADD COLUMN parent_id uuid REFERENCES public.video_categories(id) ON DELETE CASCADE;

-- Add parent_id column to link_categories for subcategories
ALTER TABLE public.link_categories 
ADD COLUMN parent_id uuid REFERENCES public.link_categories(id) ON DELETE CASCADE;

-- Add constraint to prevent subcategories from having their own subcategories (one level only)
-- This is enforced via a trigger

-- Create function to validate one-level hierarchy for video_categories
CREATE OR REPLACE FUNCTION public.validate_video_category_hierarchy()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- If this category has a parent, ensure the parent is not a subcategory itself
  IF NEW.parent_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.video_categories WHERE id = NEW.parent_id AND parent_id IS NOT NULL) THEN
      RAISE EXCEPTION 'Subcategories cannot have their own subcategories (one level only)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for video_categories
CREATE TRIGGER validate_video_category_hierarchy_trigger
BEFORE INSERT OR UPDATE ON public.video_categories
FOR EACH ROW
EXECUTE FUNCTION public.validate_video_category_hierarchy();

-- Create function to validate one-level hierarchy for link_categories
CREATE OR REPLACE FUNCTION public.validate_link_category_hierarchy()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- If this category has a parent, ensure the parent is not a subcategory itself
  IF NEW.parent_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.link_categories WHERE id = NEW.parent_id AND parent_id IS NOT NULL) THEN
      RAISE EXCEPTION 'Subcategories cannot have their own subcategories (one level only)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for link_categories
CREATE TRIGGER validate_link_category_hierarchy_trigger
BEFORE INSERT OR UPDATE ON public.link_categories
FOR EACH ROW
EXECUTE FUNCTION public.validate_link_category_hierarchy();