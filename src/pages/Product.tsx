import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && id) {
        loadRecommendation(currentUser.uid, id);
        trackView(currentUser.uid, id);
      }
    });

    if (id) {
      loadProduct(id);
    }

    return () => unsubscribe();
  }, [id]);

  const loadProduct = async (productId: string) => {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProduct({ id: docSnap.id, ...docSnap.data() });
    }
  };

  const loadRecommendation = async (userId: string, productId: string) => {
    const q = query(
      collection(db, 'recommendations'),
      where('user_id', '==', userId),
      where('product_id', '==', productId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setRecommendation(snapshot.docs[0].data());
    }
  };

  const trackView = async (userId: string, productId: string) => {
    await addDoc(collection(db, 'user_interactions'), {
      user_id: userId,
      product_id: productId,
      interaction_type: 'view',
      created_at: Timestamp.now()
    });
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({ title: "Please sign in to add items to cart" });
      return;
    }

    if (!id) return;

    await addDoc(collection(db, 'user_interactions'), {
      user_id: user.uid,
      product_id: id,
      interaction_type: 'add_to_cart',
      created_at: Timestamp.now()
    });

    const cartQuery = query(
      collection(db, 'cart_items'),
      where('user_id', '==', user.uid),
      where('product_id', '==', id)
    );
    const cartSnapshot = await getDocs(cartQuery);

    if (!cartSnapshot.empty) {
      const cartDoc = cartSnapshot.docs[0];
      await updateDoc(doc(db, 'cart_items', cartDoc.id), {
        quantity: cartDoc.data().quantity + 1
      });
    } else {
      await addDoc(collection(db, 'cart_items'), {
        user_id: user.uid,
        product_id: id,
        quantity: 1,
        created_at: Timestamp.now()
      });
    }

    toast({ title: "Added to cart!" });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="animate-fade-in">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-xl shadow-elegant"
            />
          </div>

          <div className="space-y-6 animate-fade-in">
            {recommendation && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary mb-1">AI Recommendation</p>
                      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                      <div className="mt-2">
                        <Badge variant="secondary">
                          {(recommendation.score * 100).toFixed(0)}% Match
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-6">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-muted-foreground mb-6">{product.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full bg-gradient-primary hover:opacity-90 text-white"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
