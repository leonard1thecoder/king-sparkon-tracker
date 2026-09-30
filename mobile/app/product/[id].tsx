import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { backendClient } from "@/lib/api-client";
import { convertZarToUsd, formatMoney, useLocalization } from "@/lib/localization";
import type { Product } from "@/lib/types";
import { useCart } from "@/store/cart-context";
import { Card, ErrorText, PrimaryButton, Screen, Title } from "@/components/ui";

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { add } = useCart();
  const localization = useLocalization();
  const showMoney = (zar: number) =>
    formatMoney(localization.currency === "USD" ? convertZarToUsd(zar, localization.usdToZarRate) : zar, localization.currency);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    backendClient
      .get<Product>(`/products/${id}`)
      .then((response) => {
        if (active) setProduct(response.data);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Could not load product.");
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <Screen>
      <Title>{product?.name ?? `Product ${id}`}</Title>
      <ErrorText message={error} />
      {product ? (
        <Card>
          <Text>
            {product.businessName ?? ""} · {showMoney(product.price)}
          </Text>
          <Text>
            {product.stockQuantity} in stock · {product.category}
          </Text>
          {product.returnableEnabled ? (
            <Text>Returnable · {showMoney(Number(product.returnablePrice ?? 0))} deposit each — declare empties in the cart.</Text>
          ) : null}
          <PrimaryButton
            title="Add to cart"
            onPress={() =>
              add({
                productId: product.id,
                name: product.name,
                price: product.price,
                returnableEnabled: product.returnableEnabled,
                returnablePrice: product.returnablePrice,
              })
            }
          />
        </Card>
      ) : null}
    </Screen>
  );
}
