package com.complementasenac.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.UserRecord;
import org.springframework.stereotype.Service;

@Service
public class FirebaseUserProvisioningService {

    public String upsertUser(String preferredUid, String email, String displayName, String password) {
        String normalizedEmail = email.trim().toLowerCase();
        String normalizedName = displayName == null ? "" : displayName.trim();
        String normalizedPassword = password == null ? "" : password.trim();

        try {
            if (preferredUid != null && !preferredUid.isBlank()) {
                return upsertByUid(preferredUid, normalizedEmail, normalizedName, normalizedPassword);
            }

            UserRecord byEmail = findByEmail(normalizedEmail);
            if (byEmail != null) {
                UserRecord.UpdateRequest update = new UserRecord.UpdateRequest(byEmail.getUid())
                        .setEmail(normalizedEmail)
                        .setDisplayName(normalizedName)
                        .setPassword(normalizedPassword);
                return FirebaseAuth.getInstance().updateUser(update).getUid();
            }

            UserRecord.CreateRequest create = new UserRecord.CreateRequest()
                    .setEmail(normalizedEmail)
                    .setDisplayName(normalizedName)
                    .setPassword(normalizedPassword);
            return FirebaseAuth.getInstance().createUser(create).getUid();
        } catch (FirebaseAuthException e) {
            throw new IllegalArgumentException("Falha ao sincronizar usuario no Firebase Auth.", e);
        }
    }

    public void deleteByUid(String uid) {
        if (uid == null || uid.isBlank()) {
            return;
        }
        try {
            FirebaseAuth.getInstance().deleteUser(uid);
        } catch (FirebaseAuthException e) {
            if (e.getAuthErrorCode() != AuthErrorCode.USER_NOT_FOUND) {
                throw new IllegalArgumentException("Falha ao remover usuario do Firebase Auth.", e);
            }
        }
    }

    private String upsertByUid(String uid, String email, String displayName, String password) throws FirebaseAuthException {
        UserRecord current = findByUid(uid);
        UserRecord byEmail = findByEmail(email);
        if (byEmail != null && !byEmail.getUid().equals(uid)) {
            throw new IllegalArgumentException("Ja existe um usuario com este e-mail no Firebase Auth.");
        }

        if (current != null) {
            UserRecord.UpdateRequest update = new UserRecord.UpdateRequest(uid)
                    .setEmail(email)
                    .setDisplayName(displayName)
                    .setPassword(password);
            return FirebaseAuth.getInstance().updateUser(update).getUid();
        }

        UserRecord.CreateRequest create = new UserRecord.CreateRequest()
                .setUid(uid)
                .setEmail(email)
                .setDisplayName(displayName)
                .setPassword(password);
        return FirebaseAuth.getInstance().createUser(create).getUid();
    }

    private UserRecord findByUid(String uid) throws FirebaseAuthException {
        try {
            return FirebaseAuth.getInstance().getUser(uid);
        } catch (FirebaseAuthException e) {
            if (e.getAuthErrorCode() == AuthErrorCode.USER_NOT_FOUND) {
                return null;
            }
            throw e;
        }
    }

    private UserRecord findByEmail(String email) throws FirebaseAuthException {
        try {
            return FirebaseAuth.getInstance().getUserByEmail(email);
        } catch (FirebaseAuthException e) {
            if (e.getAuthErrorCode() == AuthErrorCode.USER_NOT_FOUND) {
                return null;
            }
            throw e;
        }
    }
}
