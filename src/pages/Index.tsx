import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateRecommendations } from "@/lib/gemini";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image_url: string;
  tags: string[];
}

interface Recommendation {
  product_id: string;
  reason: string;
  score: number;
}

const CATEGORIES = ["All", "Accessories", "Beauty", "Books", "Electronics", "Fashion", "Home", "Sports"];

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingRecs, setLoadingRecs] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadRecommendations(session.user.id);
      } else {
        setRecommendations([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({ title: "Error loading products", variant: "destructive" });
    }
  };

  const loadRecommendations = async (userId: string) => {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId);
    
    if (!error && data) {
      setRecommendations(data);
    }
  };

  const generateAIRecommendations = async () => {
    setLoadingRecs(true);
    try {
      let recs: Recommendation[] = [] as any;

      if (!user) {
        // Guest preview mode: no writes, generate from available products only
        recs = await generateRecommendations([], [], products);
        setRecommendations(recs);
        toast({
          title: "Recommendations Ready (Preview)",
          description: `Generated ${recs.length} picks without sign-in. Sign in to save them.`
        });
        return;
      }

      // Authenticated path — use interactions and persist recs
      const { data: interactions } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id);

      const viewedProductIds = (interactions || [])
        .filter(i => i.interaction_type === 'view')
        .map(i => i.product_id);
      const cartProductIds = (interactions || [])
        .filter(i => i.interaction_type === 'add_to_cart')
        .map(i => i.product_id);

      const viewedProducts = products.filter(p => viewedProductIds.includes(p.id));
      const cartProducts = products.filter(p => cartProductIds.includes(p.id));

      recs = await generateRecommendations(viewedProducts, cartProducts, products);

      // Delete old recommendations
      await supabase
        .from('recommendations')
        .delete()
        .eq('user_id', user.id);

      // Store new recommendations
      const recsToInsert = recs.map(rec => ({
        user_id: user.id,
        product_id: rec.product_id,
        reason: rec.reason,
        score: rec.score
      }));

      await supabase.from('recommendations').insert(recsToInsert);

      await loadRecommendations(user.id);
      toast({
        title: "AI Recommendations Ready!",
        description: `Generated ${recs.length} personalized picks for you.`
      });
    } catch (error: any) {
      toast({
        title: "Error generating recommendations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast({ title: "Please sign in to add items to cart" });
      return;
    }

    // Track interaction
    await supabase.from('user_interactions').insert({
      user_id: user.id,
      product_id: productId,
      interaction_type: 'add_to_cart'
    });

    // Check if already in cart
    const { data: existingCart } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existingCart) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingCart.quantity + 1 })
        .eq('id', existingCart.id);
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1
      });
    }

    toast({ title: "Added to cart!" });
  };

  const handleProductView = async (productId: string) => {
    if (user) {
      await supabase.from('user_interactions').insert({
        user_id: user.id,
        product_id: productId,
        interaction_type: 'view'
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const recommendedProducts = filteredProducts.filter(p => 
    recommendations.some(r => r.product_id === p.id)
  );
  
  const otherProducts = filteredProducts.filter(p => 
    !recommendations.some(r => r.product_id === p.id)
  );

  const getRecommendation = (productId: string) => 
    recommendations.find(r => r.product_id === productId);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4 bg-primary/10 text-primary border-0">
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered Recommendations
        </Badge>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
          Discover Your Perfect Products
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
          Experience intelligent shopping with personalized AI recommendations
        </p>

        <Button 
          onClick={generateAIRecommendations}
          disabled={loadingRecs}
          className="bg-gradient-primary hover:opacity-90 text-white animate-scale-in"
          size="lg"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          {loadingRecs ? "Generating..." : "Get AI Recommendations"}
        </Button>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 pb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-gradient-primary text-white" : ""}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Recommended For You</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendedProducts.map(product => (
              <div key={product.id} onClick={() => handleProductView(product.id)}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  isAuthenticated={!!user}
                  recommendation={getRecommendation(product.id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="container mx-auto px-4 pb-16">
        {recommendedProducts.length > 0 && (
          <h2 className="text-3xl font-bold mb-6">All Products</h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {otherProducts.map(product => (
            <div key={product.id} onClick={() => handleProductView(product.id)}>
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                isAuthenticated={!!user}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;