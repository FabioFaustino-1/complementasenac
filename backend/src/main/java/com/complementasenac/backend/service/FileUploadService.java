package com.complementasenac.backend.service;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Storage;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

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

    public String gerarUrlVisualizacao(String urlSalva) {
        if (urlSalva == null || urlSalva.isBlank() || urlSalva.startsWith("data:")) {
            return urlSalva;
        }

        StorageObjectRef objectRef = extrairObjeto(urlSalva);
        if (objectRef == null) {
            return urlSalva;
        }

        Storage storage = StorageClient.getInstance().bucket().getStorage();
        Blob blob = storage.get(objectRef.bucket(), objectRef.objectName());
        if (blob == null) {
            return urlSalva;
        }

        return blob.signUrl(
                15,
                TimeUnit.MINUTES,
                Storage.SignUrlOption.withV4Signature()
        ).toString();
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

    private StorageObjectRef extrairObjeto(String urlSalva) {
        String valor = urlSalva.trim();
        if (valor.startsWith("gs://")) {
            String semProtocolo = valor.substring("gs://".length());
            int slash = semProtocolo.indexOf("/");
            if (slash <= 0 || slash == semProtocolo.length() - 1) {
                return null;
            }
            return new StorageObjectRef(semProtocolo.substring(0, slash), semProtocolo.substring(slash + 1));
        }

        String storagePrefix = "https://storage.googleapis.com/";
        if (valor.startsWith(storagePrefix)) {
            String semPrefixo = valor.substring(storagePrefix.length());
            int slash = semPrefixo.indexOf("/");
            if (slash <= 0 || slash == semPrefixo.length() - 1) {
                return null;
            }
            return new StorageObjectRef(semPrefixo.substring(0, slash), semPrefixo.substring(slash + 1));
        }

        String firebasePrefix = "https://firebasestorage.googleapis.com/v0/b/";
        if (valor.startsWith(firebasePrefix)) {
            String semPrefixo = valor.substring(firebasePrefix.length());
            int marker = semPrefixo.indexOf("/o/");
            if (marker <= 0 || marker + 3 >= semPrefixo.length()) {
                return null;
            }
            String bucket = semPrefixo.substring(0, marker);
            String objectName = semPrefixo.substring(marker + 3);
            int query = objectName.indexOf("?");
            if (query >= 0) {
                objectName = objectName.substring(0, query);
            }
            return new StorageObjectRef(bucket, URLDecoder.decode(objectName, StandardCharsets.UTF_8));
        }

        return null;
    }

    private record StorageObjectRef(String bucket, String objectName) {
    }
}
