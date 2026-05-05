package com.complementasenac.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    private static final Logger LOGGER = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${app.firebase.credentials-file:pi-3-286ed-firebase-adminsdk-fbsvc-d4d68e7e19.json}")
    private String credentialsFile;
    @Value("${app.firebase.storage-bucket:}")
    private String storageBucket;

    @PostConstruct
    public void init() {
        try {
            InputStream serviceAccount =
                getClass().getClassLoader().getResourceAsStream(credentialsFile);
            if (serviceAccount == null) {
                LOGGER.warn("Arquivo de credenciais do Firebase nao encontrado: {}", credentialsFile);
                return;
            }

            FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount));
            if (storageBucket != null && !storageBucket.isBlank()) {
                optionsBuilder.setStorageBucket(storageBucket);
            }
            FirebaseOptions options = optionsBuilder.build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

        } catch (Exception e) {
            LOGGER.error("Falha ao inicializar Firebase: {}", e.getMessage());
        }
    }
}