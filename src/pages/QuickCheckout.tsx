import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProducts } from "../services/productService";
import { placeOrder } from "../services/orderService";
import { Product } from "../types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Banknote, ShoppingBag } from "lucide-react";

const QuickCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);

  const [formData, setFormData] = useState({
    user_name: "",
    user_phone: "",
    user_email: "",
    shipping_address: "",
    payment_method: "Cash on Delivery",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        const activeProducts = data.filter(
          (p) => p.isActive && p.stockQuantity > 0,
        );
        setProducts(activeProducts);

        // Check for URL params
        const urlProductId = searchParams.get("productId");
        const urlQuantity = searchParams.get("quantity");
        const urlName = searchParams.get("name");
        const urlAddress = searchParams.get("address");
        const urlPhone = searchParams.get("phone");
        const urlEmail = searchParams.get("email");

        if (urlProductId) {
          const product = activeProducts.find(
            (p) => p.id === parseInt(urlProductId),
          );
          if (product) {
            setSelectedProduct(product);
            if (urlQuantity) {
              setQuantity(parseInt(urlQuantity));
            }
          }
        }

        if (urlName || urlAddress || urlPhone || urlEmail) {
          setFormData((prev) => ({
            ...prev,
            user_name: urlName || prev.user_name,
            shipping_address: urlAddress || prev.shipping_address,
            user_phone: urlPhone || prev.user_phone,
            user_email: urlEmail || prev.user_email,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
        toast.error("Failed to load products");
      } finally {
        setFetchingProducts(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === parseInt(productId));
    setSelectedProduct(product || null);
    setQuantity(1);
  };

  const getTotalPrice = () => {
    if (!selectedProduct) return 0;
    return selectedProduct.price * quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    if (
      !formData.user_name ||
      !formData.user_phone ||
      !formData.shipping_address
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.user_phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (quantity > selectedProduct.stockQuantity) {
      toast.error(`Only ${selectedProduct.stockQuantity} items available`);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...formData,
        items: [
          {
            product_id: selectedProduct.id,
            quantity: quantity,
          },
        ],
      };

      const response = await placeOrder(orderData);
      toast.success("Order placed successfully!");
      navigate(`/order-confirmation/${response.order_id}`, {
        state: { orderDetails: response },
      });
    } catch (error: any) {
      console.error("Order placement failed:", error);
      const errorMessage =
        error.response?.data?.detail || "Failed to place order";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProducts) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <ShoppingBag className="mr-2 h-6 w-6" />
          <h1 className="text-2xl font-bold">Quick Checkout</h1>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Place Your Order</CardTitle>
              <CardDescription>
                Select a product and complete your order details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-4">
                  <Label htmlFor="product">Select Product *</Label>
                  <Select onValueChange={handleProductSelect}>
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
                          {product.name} - ${product.price} (
                          {product.stockQuantity} in stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedProduct && (
                    <div className="rounded-lg border p-4">
                      <div className="flex gap-4">
                        {selectedProduct.imageUrl && (
                          <img
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            className="h-24 w-24 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {selectedProduct.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedProduct.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-lg font-bold">
                              ${selectedProduct.price}
                            </span>
                            <Badge>
                              {selectedProduct.stockQuantity} available
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <Label htmlFor="quantity">Quantity:</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={selectedProduct.stockQuantity}
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Math.max(1, parseInt(e.target.value) || 1),
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">
                          Total:{" "}
                          <span className="font-bold">
                            ${getTotalPrice().toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Customer Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.user_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            user_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="1234567890"
                        value={formData.user_phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            user_phone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.user_email}
                      onChange={(e) =>
                        setFormData({ ...formData, user_email: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Shipping Address *</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State, ZIP"
                      value={formData.shipping_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping_address: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div className="space-y-4">
                  <Label>Payment Method *</Label>
                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value) =>
                      setFormData({ ...formData, payment_method: value })
                    }
                  >
                    <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="Cash on Delivery" id="cod" />
                      <Label
                        htmlFor="cod"
                        className="flex flex-1 cursor-pointer items-center gap-2"
                      >
                        <Banknote className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive your order
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="Debit Card" id="debit" />
                      <Label
                        htmlFor="debit"
                        className="flex flex-1 cursor-pointer items-center gap-2"
                      >
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Debit Card</p>
                          <p className="text-sm text-muted-foreground">
                            Pay securely with your debit card
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || !selectedProduct}
                >
                  {loading
                    ? "Placing Order..."
                    : `Place Order - $${getTotalPrice().toFixed(2)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuickCheckout;
