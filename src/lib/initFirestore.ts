import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const SAMPLE_PRODUCTS = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    category: "Electronics",
    description: "Premium over-ear headphones with active noise cancellation and 30-hour battery life",
    price: 299.99,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    tags: ["audio", "wireless", "premium"]
  },
  {
    name: "Smart Fitness Watch",
    category: "Electronics",
    description: "Track your health and fitness goals with GPS, heart rate monitoring, and sleep tracking",
    price: 249.99,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    tags: ["fitness", "health", "smartwatch"]
  },
  {
    name: "Minimalist Leather Wallet",
    category: "Accessories",
    description: "Slim RFID-blocking wallet crafted from genuine Italian leather",
    price: 49.99,
    image_url: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7",
    tags: ["leather", "minimalist", "rfid"]
  },
  {
    name: "Portable Bluetooth Speaker",
    category: "Electronics",
    description: "Waterproof speaker with 360° sound and 20-hour playtime",
    price: 89.99,
    image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
    tags: ["audio", "portable", "waterproof"]
  },
  {
    name: "Organic Cotton T-Shirt",
    category: "Fashion",
    description: "Soft, breathable, and sustainably made basic tee in multiple colors",
    price: 29.99,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    tags: ["organic", "cotton", "sustainable"]
  },
  {
    name: "Stainless Steel Water Bottle",
    category: "Home",
    description: "Insulated bottle keeps drinks cold for 24h or hot for 12h",
    price: 34.99,
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
    tags: ["insulated", "eco-friendly", "reusable"]
  },
  {
    name: "Yoga Mat with Alignment Markers",
    category: "Sports",
    description: "Non-slip 6mm thick mat perfect for all types of yoga practice",
    price: 59.99,
    image_url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f",
    tags: ["yoga", "fitness", "non-slip"]
  },
  {
    name: "Aromatherapy Essential Oil Set",
    category: "Beauty",
    description: "Collection of 10 pure essential oils for relaxation and wellness",
    price: 44.99,
    image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108",
    tags: ["aromatherapy", "wellness", "natural"]
  },
  {
    name: "Mechanical Gaming Keyboard",
    category: "Electronics",
    description: "RGB backlit keyboard with customizable keys and tactile switches",
    price: 129.99,
    image_url: "https://images.unsplash.com/photo-1595225476474-87563907a212",
    tags: ["gaming", "rgb", "mechanical"]
  },
  {
    name: "Canvas Tote Bag",
    category: "Accessories",
    description: "Durable and spacious eco-friendly bag for everyday use",
    price: 24.99,
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
    tags: ["eco-friendly", "canvas", "reusable"]
  },
  {
    name: "LED Desk Lamp",
    category: "Home",
    description: "Adjustable brightness lamp with USB charging port and modern design",
    price: 39.99,
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
    tags: ["led", "adjustable", "usb"]
  },
  {
    name: "Cookbook: Healthy Meals in 30 Minutes",
    category: "Books",
    description: "100+ quick and nutritious recipes for busy lifestyles",
    price: 22.99,
    image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
    tags: ["cookbook", "healthy", "quick-meals"]
  },
  {
    name: "Running Shoes",
    category: "Sports",
    description: "Lightweight cushioned shoes designed for long-distance running",
    price: 119.99,
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    tags: ["running", "athletic", "cushioned"]
  },
  {
    name: "Face Serum with Vitamin C",
    category: "Beauty",
    description: "Brightening serum that reduces dark spots and evens skin tone",
    price: 38.99,
    image_url: "https://images.unsplash.com/photo-1620916297254-9f2f40c3c9a8",
    tags: ["skincare", "vitamin-c", "brightening"]
  },
  {
    name: "Bluetooth Wireless Mouse",
    category: "Electronics",
    description: "Ergonomic mouse with silent clicks and precision tracking",
    price: 27.99,
    image_url: "https://images.unsplash.com/photo-1527814050087-3793815479db",
    tags: ["wireless", "ergonomic", "bluetooth"]
  }
];

export const initializeFirestore = async () => {
  console.log('Initializing Firestore with sample products...');
  
  try {
    const promises = SAMPLE_PRODUCTS.map(product =>
      addDoc(collection(db, 'products'), {
        ...product,
        created_at: Timestamp.now()
      })
    );
    
    await Promise.all(promises);
    console.log('Sample products added successfully!');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
};
