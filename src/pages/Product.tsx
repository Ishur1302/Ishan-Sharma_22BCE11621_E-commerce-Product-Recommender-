import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image_url: string;
  tags: string[];
}

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user && id) {
        loadRecommendation(user.id, id);
        trackView(user.id, id);
      }
    });
  }, [id]);

  const loadProduct = async (productId: string) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (data) setProduct(data);
  };

  const loadRecommendation = async (userId: string, productId: string) => {
    const { data } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();
    
    if (data) setRecommendation(data);
  };

  const trackView = async (userId: string, productId: string) => {
    await supabase.from('user_interactions').insert({
      user_id: userId,
      product_id: productId,
      interaction_type: 'view'
    });
  };

  const handleAddToCart = async () => {
    if (!user || !product) {
      toast({ title: "Please sign in to add items to cart" });
      return;
    }

    await supabase.from('user_interactions').insert({
      user_id: user.id,
      product_id: product.id,
      interaction_type: 'add_to_cart'
    });

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .single();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        });
    }

    toast({ title: "Added to cart!" });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-card">
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-6">${product.price}</p>
              <p className="text-lg text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {recommendation && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary mb-2">
                        AI Recommendation ({Math.round(recommendation.score * 100)}% match)
                      </h3>
                      <p className="text-sm">{recommendation.reason}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={!user}
              className="w-full bg-gradient-primary hover:opacity-90 text-white"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>

            {!user && (
              <p className="text-sm text-center text-muted-foreground">
                <Link to="/auth" className="text-primary underline">
                  Sign in
                </Link>{" "}
                to add items to your cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;