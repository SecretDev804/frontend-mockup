import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "",
};

export const userPool = new CognitoUserPool(poolData);

export type AuthSession = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
};

const mapSession = (session: CognitoUserSession): AuthSession => ({
  accessToken: session.getAccessToken().getJwtToken(),
  idToken: session.getIdToken().getJwtToken(),
  refreshToken: session.getRefreshToken().getToken(),
});

export const signUpUser = (email: string, password: string) =>
  new Promise<{ userSub: string }>((resolve, reject) => {
    userPool.signUp(email, password, [], [], (err, result) => {
      if (err || !result) {
        reject(err || new Error("Sign up failed."));
        return;
      }
      resolve({ userSub: result.userSub });
    });
  });

export const signInUser = (email: string, password: string) =>
  new Promise<AuthSession>((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(mapSession(session)),
      onFailure: (err) => reject(err),
      newPasswordRequired: () =>
        reject(new Error("Password reset required.")),
    });
  });

export const storeSession = (session: AuthSession) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem("goobiez_access_token", session.accessToken);
  localStorage.setItem("goobiez_id_token", session.idToken);
  localStorage.setItem("goobiez_refresh_token", session.refreshToken);
};

export const resendConfirmationCode = (email: string) =>
  new Promise<void>((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.resendConfirmationCode((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

export const confirmSignUp = (email: string, code: string) =>
  new Promise<void>((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

export const forgotPassword = (email: string) =>
  new Promise<void>((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
      inputVerificationCode: () => resolve(),
    });
  });

export const confirmForgotPassword = (
  email: string,
  code: string,
  newPassword: string
) =>
  new Promise<void>((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });

export const changePassword = (
  email: string,
  oldPassword: string,
  newPassword: string
) =>
  new Promise<void>((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: oldPassword,
    });

    user.authenticateUser(authDetails, {
      onSuccess: () => {
        user.changePassword(oldPassword, newPassword, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      },
      onFailure: (err) => reject(err),
    });
  });
