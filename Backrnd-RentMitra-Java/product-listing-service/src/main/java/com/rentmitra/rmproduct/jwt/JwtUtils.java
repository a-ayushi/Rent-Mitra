package com.rentmitra.rmproduct.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.apache.commons.codec.binary.Base64;
import org.springframework.stereotype.Component;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;

@Component
public class JwtUtils {

    private static final String PEM_PUBLIC_KEY =
            "-----BEGIN PUBLIC KEY-----\n" +
                    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmsLDSsOTF1DRMtEsaGOW\n" +
                    "7k9qbP8qrFN7/SQwIGPbOwFiij53tgxcUPOfpEu0AR0KiuS+P0ryCnwcYSx2PKoR\n" +
                    "J8tJVPbcrUQOgln3eBaJ5vFKHqO58upT52zaGyht8PWrSa4hx7+kqDVWYH8mpquO\n" +
                    "jnkLRsPMaMt4KuAfCodq6P8UjAjXxTFgDQl2Li8Vw6yxHgvT+oTUi5xCCNvc1XZy\n" +
                    "3COfsDI4GLsVDREVC0kkoAU4xh4QLPXxiLV8SsXvxej2Kn5eOtGfw+4HxltO+oog\n" +
                    "X+xqaJzolKYqwWBIe7rkGl0xdM/tBwdFe6mRkXNJ2OSD+C2cu6+UJyd8mdihRXPg\n" +
                    "9QIDAQAB\n" +
                    "-----END PUBLIC KEY-----\n";

    public PublicKey getPublicKeyFromPem() throws Exception {
        // Remove headers, footers, and newlines
        String publicKeyPEM = PEM_PUBLIC_KEY
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        // Decode the base64-encoded public key
        byte[] keyBytes = Base64.decodeBase64(publicKeyPEM);

        // Create RSA PublicKey
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        X509EncodedKeySpec x509EncodedKeySpec = new X509EncodedKeySpec(keyBytes);
        return keyFactory.generatePublic(x509EncodedKeySpec);
    }

    public String extractPhoneNumber(String token) {
        System.out.println(token);
        try {
            // Parse JWT and validate with the public key
            Claims claims = Jwts.parser()
                    .setSigningKey(getPublicKeyFromPem())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject(); // Assuming the phone number is stored in the 'sub' field
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid token", e);
        }
    }
}
