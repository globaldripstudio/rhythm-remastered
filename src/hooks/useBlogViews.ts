import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BlogView {
  slug: string;
  view_count: number;
}

export const useBlogViews = () => {
  const [views, setViews] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_views")
          .select("slug, view_count");

        if (error) {
          console.error("Error fetching blog views:", error);
          return;
        }

        const viewsMap: Record<string, number> = {};
        data?.forEach((item: BlogView) => {
          viewsMap[item.slug] = item.view_count;
        });
        setViews(viewsMap);
      } catch (err) {
        console.error("Error fetching blog views:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchViews();
  }, []);

  return { views, isLoading };
};

export const trackBlogView = async (slug: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase.functions.invoke("track-blog-view", {
      body: { slug },
    });

    if (error) {
      console.error("Error tracking view:", error);
      return null;
    }

    return data?.view_count ?? null;
  } catch (err) {
    console.error("Error tracking view:", err);
    return null;
  }
};