import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Pin, PinOff, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/components/ui/use-toast";

interface AdminReview {
  id: number;
  toolName: string;
  rating: number;
  comment: string;
  userName: string;
  userEmail: string | null;
  createdAt: string;
  isPinned: boolean;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/admin/reviews");
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });

      const data = await response.json();
      if (data.success) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        toast({
          title: "Success",
          description: "Review deleted",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (reviewId: number, currentPin: boolean) => {
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, isPinned: !currentPin }),
      });

      const data = await response.json();
      if (data.success) {
        setReviews(reviews.map(r => 
          r.id === reviewId ? { ...r, isPinned: !currentPin } : r
        ));
        toast({
          title: "Success",
          description: !currentPin ? "Review pinned" : "Review unpinned",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Manage Reviews</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Reviews</p>
            <p className="text-2xl font-bold">{reviews.length}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Pinned</p>
            <p className="text-2xl font-bold">{reviews.filter(r => r.isPinned).length}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <p className="text-2xl font-bold">
              {reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : "N/A"
              }
            </p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reviews yet</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-card border border-border rounded-lg hover:bg-card/80 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{review.userName}</h3>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        {review.toolName}
                      </span>
                      {review.isPinned && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                          📌 Pinned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">Rating:</span>
                      <span className="text-sm font-medium">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {review.userEmail && <span>{review.userEmail}</span>}
                    </p>
                    <p className="mt-2 text-sm break-words">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePin(review.id, review.isPinned)}
                      title={review.isPinned ? "Unpin review" : "Pin review"}
                    >
                      {review.isPinned ? (
                        <PinOff className="w-4 h-4" />
                      ) : (
                        <Pin className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
