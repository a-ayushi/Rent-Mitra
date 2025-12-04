package com.rent_mitra.api_gateway.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    Logger logger = LoggerFactory.getLogger(JwtService.class);

    private static final String RSA_PRIVATE_KEY =
            "-----BEGIN PRIVATE KEY-----\n" + "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCawsNKw5MXUNEy\n" +
                    "0SxoY5buT2ps/yqsU3v9JDAgY9s7AWKKPne2DFxQ85+kS7QBHQqK5L4/SvIKfBxh\n" +
                    "LHY8qhEny0lU9tytRA6CWfd4Fonm8Uoeo7ny6lPnbNobKG3w9atJriHHv6SoNVZg\n" +
                    "fyamq46OeQtGw8xoy3gq4B8Kh2ro/xSMCNfFMWANCXYuLxXDrLEeC9P6hNSLnEII\n" +
                    "29zVdnLcI5+wMjgYuxUNERULSSSgBTjGHhAs9fGItXxKxe/F6PYqfl460Z/D7gfG\n" +
                    "W076iiBf7GponOiUpirBYEh7uuQaXTF0z+0HB0V7qZGRc0nY5IP4LZy7r5QnJ3yZ\n" +
                    "2KFFc+D1AgMBAAECggEABtuKe82evvG901qhdR60mWq7dIj6AxjP7a+k0kqadErj\n" +
                    "auzJsS9rB8tDz6vrFgGLbgwkwfk4MG6/cy7dLmL6z6CaZ0FpFeRmIDCMXq3g/nLC\n" +
                    "rgjjPHhVr3OLVpi8BmlcZa9pn8hGK43xfeUkeU4wyu9iKIiUjjA16vBzb6wAeMKD\n" +
                    "JbHg+on3YSCFTpDkSUmvOeCKvW7x3aWcATN/oYjubKMczXWJ8PXKqdw4crmUbDV5\n" +
                    "4xiTKkKonrMTSZDMhHnDKUtvVAW0+7+59zwDNlvnvWtPJCi17Vai+N+WOUlTk/9f\n" +
                    "WTesi2ApWJLTWJrCWVy5hCRI7wKYwXyoV0nDo5FfIQKBgQDQrmhdLFa2+KWSVZNd\n" +
                    "fWGSm/xs1jV0+fKo7ENN0vk6Hi5nk8Y1ft7NzKRc8GQ1MIsbhK63r9yVkYfanUlC\n" +
                    "UotLSZX0QbGxsftx5refyEL1SHkIX6ihPAz7pvWJFQrUZKOfmVlVXXkLvSDC1mDv\n" +
                    "Iyi+yLc8mFtFYdlIeZwXvaUXLwKBgQC92lzksrAtZBcoVZfxNNdqW/97ER7GIN8M\n" +
                    "3/1VcSlNaH0z1EgYmHk54gWNLcG/rKo88NI7UvoTNOnBAQy22+RmM4tEpMILj8Ty\n" +
                    "WdK4J8b7uWLCsu2/aGqcdSqmpBUvrmmVVNmFwzwAjjXzGb13QtypmtoSRZMYG5Jz\n" +
                    "P8lTdnDBGwKBgA5Z4C2ALhp5MRHGNtM4Gyy084AcnyKDSe/aB6rjdmZLyw8ud3QY\n" +
                    "XIQ0rZ0CnzGVPAvRbR6OxpG2p2weYvpfqNqtndVlay34On2Ty07+u7QYntI3meY0\n" +
                    "tgPccIhT3SHMJgCE0ELxobBv+j/L9HCdr2CndwqAw84as5GrY1OypBbbAoGAPIfF\n" +
                    "fEkYcLBrzblUg1wEnm2MjBFOTX8nfnRf0gENWRfKa17wSZ87b2AHwxZmopULhfiG\n" +
                    "HtH612rUaGvMQPTk4kzmx1D8aTFCar6Gt54/C/z0Zv0jXhaNfyrAGXdRJe2mzizK\n" +
                    "WaKAm/C7dLGtPbv8nLq5cn/qQRJxY/tfVhP6KScCgYEAjbxvHMI3gNM4kJigcjBG\n" +
                    "HmNl/GlKeN1EGPGhKmndy9HAybucvOFkyySagotISzheTZ4Pjjxu6pU5K5OoMA/T\n" +
                    "iUdPlfRbGCfqElsEbo2n9wNL6zyN2n5a0o7CIs7y6N9z6tUvowbvBT2GIdjLxHIP\n" +
                    "cKJ1Z9qVbXad1klWG2zN4iM=" +
                    "-----END PRIVATE KEY-----";

    private PrivateKey getPrivateKey() throws Exception {
        String privateKeyPEM = RSA_PRIVATE_KEY
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", ""); // Remove all whitespace

        byte[] keyBytes = Base64.decodeBase64(privateKeyPEM);

        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(keySpec);
    }

    public String generateToken(String mobileNumber) throws Exception {
        logger.info("token generation using mobile number :{}",mobileNumber);
        Map<String, Object> claims = new HashMap<>();
        claims.put("mobile", mobileNumber);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(mobileNumber)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(SignatureAlgorithm.RS256, getPrivateKey())
                .compact();
    }




}
