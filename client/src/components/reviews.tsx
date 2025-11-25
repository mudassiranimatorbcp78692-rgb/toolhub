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

// Simple MD5 hash for Gravatar
const md5Hash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
};

// Get Gravatar URL
const getGravatarUrl = (email: string, size: number = 40) => {
  const trimmedEmail = email.toLowerCase().trim();
  const hash = md5Hash(trimmedEmail);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;
};

// Generate avatar from initials with SVG
const getInitialAvatar = (name: string): string => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bgColor = colors[Math.abs(hash) % colors.length];
  
  const svg = `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="${bgColor}"/><text x="50%" y="50%" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dy=".3em" font-family="system-ui">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

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
        
        // Optimistically add the new review to the list
        if (data.review) {
          const newReview: Review = {
            id: data.review.id,
            toolName: data.review.toolName,
            rating: data.review.rating,
            comment: data.review.comment,
            userName: data.review.userName,
            userEmail: data.review.userEmail,
            createdAt: data.review.createdAt || new Date().toISOString(),
          };
          setReviews([newReview, ...reviews]);
        }
        
        setComment("");
        setUserName("");
        setUserEmail("");
        setRating(5);
        
        // Also fetch to sync with server
        setTimeout(() => fetchReviews(), 500);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Submit error:", error);
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
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name *</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                        : "text-muted-foreground"
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
              className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border border-border rounded-lg bg-muted/30 space-y-3"
                >
                  {/* Review Header with Avatar */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <img
                        src={review.userEmail ? getGravatarUrl(review.userEmail) : getInitialAvatar(review.userName)}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getInitialAvatar(review.userName);
                        }}
                      />
                    </div>
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm break-words">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
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
