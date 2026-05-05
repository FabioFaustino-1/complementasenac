package com.complementasenac.backend.service;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    public String uploadDataUrl(String dataUrl, String uidAluno) {
        if (dataUrl == null || dataUrl.isBlank()) {
            return null;
        }
        if (!dataUrl.startsWith("data:")) {
            return dataUrl;
        }

        int split = dataUrl.indexOf(",");
        if (split < 0) {
            throw new IllegalArgumentException("Comprovante invalido.");
        }
        String metadata = dataUrl.substring(5, split);
        String base64Content = dataUrl.substring(split + 1);
        String contentType = metadata.contains(";") ? metadata.substring(0, metadata.indexOf(";")) : "application/octet-stream";
        String extensao = contentType.contains("/") ? contentType.substring(contentType.indexOf("/") + 1) : "bin";

        byte[] bytes = Base64.getDecoder().decode(base64Content);
        String bucket = resolverBucketExistente();
        String objectName = String.format("solicitacoes/%s/%s.%s", uidAluno, UUID.randomUUID(), extensao);

        BlobInfo blobInfo = BlobInfo.newBuilder(bucket, objectName).setContentType(contentType).build();
        StorageClient.getInstance().bucket().getStorage().create(blobInfo, bytes);

        return String.format("https://storage.googleapis.com/%s/%s", bucket, objectName);
    }

    private String resolverBucketExistente() {
        Storage storage = StorageClient.getInstance().bucket().getStorage();
        String configured = FirebaseApp.getInstance().getOptions().getStorageBucket();
        String projectId = FirebaseApp.getInstance().getOptions().getProjectId();

        List<String> candidatos = new ArrayList<>();
        if (configured != null && !configured.isBlank()) {
            candidatos.add(configured.trim());
        }
        if (projectId != null && !projectId.isBlank()) {
            candidatos.add(projectId + ".firebasestorage.app");
            candidatos.add(projectId + ".appspot.com");
        }

        for (String bucketNome : candidatos) {
            Bucket bucket = storage.get(bucketNome);
            if (bucket != null) {
                return bucketNome;
            }
        }
        throw new IllegalArgumentException("Bucket do Firebase Storage nao encontrado. Configure app.firebase.storage-bucket com um bucket valido.");
    }
}
