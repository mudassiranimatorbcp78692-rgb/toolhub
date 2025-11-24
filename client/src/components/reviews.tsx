import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Star, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewsProps {
  toolName: string;
}

interface Review {
  id: string;
  toolName: string;
  rating: number;
  comment: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
}

export function Reviews({ toolName }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [toolName]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/reviews?toolName=${encodeURIComponent(toolName)}`
      );
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || !userName.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in your name and comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName,
          rating,
          comment,
          userName,
          userEmail: userEmail || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Thank you!",
          description: "Your review has been submitted successfully.",
        });
        setComment("");
        setUserName("");
        setUserEmail("");
        setRating(5);
        fetchReviews();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 mt-12 pt-8 border-t">
      <div>
        <h3 className="text-2xl font-semibold mb-6">Reviews & Ratings</h3>

        {/* Submit Review Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name *</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border rounded-md text-sm"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email (optional)</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border rounded-md text-sm"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-all hover:scale-110"
                >
                  <Star
                    size={24}
                    className={cn(
                      "transition-colors",
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Review *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Share your experience with this tool... (max 500 characters)"
              className="w-full px-3 py-2 border rounded-md text-sm min-h-[100px]"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/500 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <>Loading...</>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          <h4 className="font-semibold">
            {reviews.length > 0
              ? `${reviews.length} Review${reviews.length !== 1 ? "s" : ""}`
              : "No reviews yet"}
          </h4>

          {loading ? (
            <p className="text-muted-foreground">Loading reviews...</p>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border rounded-lg bg-card space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{review.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Be the first to review this tool!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
