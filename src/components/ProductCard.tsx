import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
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

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  isAuthenticated: boolean;
  recommendation?: {
    reason: string;
    score: number;
  };
}

export const ProductCard = ({ product, onAddToCart, isAuthenticated, recommendation }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-card-hover transition-all duration-300 animate-fade-in">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.image_url}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {recommendation && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-gradient-primary text-white border-0">
                AI Pick {Math.round(recommendation.score * 100)}%
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <div className="mb-2">
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        </Link>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {(product.tags ?? []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {recommendation && (
          <div className="text-xs text-primary bg-primary/10 p-2 rounded-md mb-3">
            <p className="line-clamp-2">{recommendation.reason}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="text-2xl font-bold">${product.price}</span>
        <Button 
          onClick={() => onAddToCart(product.id)}
          disabled={!isAuthenticated}
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
};