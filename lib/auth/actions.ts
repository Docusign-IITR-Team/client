import { BuiltInProviderType } from "next-auth/providers/index";
import {
  LiteralUnion,
  SignInAuthorizationParams,
  SignInOptions,
  SignOutParams,
  signOut,
  signIn as nextAuthSignIn
} from "next-auth/react";

import docusign from 'docusign-esign';

interface DocuSignConfig {
  integratorKey: string;
  apiBasePath: string;
  accountId: string;
  accessToken: string;
}

interface SigningRequest {
  documentPath: string;
  documentName: string;
  recipients: {
    email: string;
    name: string;
    recipientId: string;
  }[];
  emailSubject: string;
  emailMessage?: string;
}

export const signIn = async (
  provider?: LiteralUnion<BuiltInProviderType> | undefined,
  options?: SignInOptions | undefined,
  authorizationParams?: SignInAuthorizationParams | undefined
) => {
    return nextAuthSignIn(provider, options, authorizationParams);
};

export const logOut = async (options?: SignOutParams<true> | undefined) => {
  return signOut(options);
};

export const sendDocuSignRequest = async (
  config: DocuSignConfig,
  signingRequest: SigningRequest
): Promise<string> => {
  try {
    // Initialize DocuSign API client
    const dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(config.apiBasePath);
    dsApiClient.addDefaultHeader('Authorization', `Bearer ${config.accessToken}`);

    // Initialize envelope API
    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Read the file content
    const document = await fetch(signingRequest.documentPath).then(res => res.arrayBuffer());
    
    // Create envelope definition
    const envelopeDefinition = {
      emailSubject: signingRequest.emailSubject,
      emailBlurb: signingRequest.emailMessage,
      documents: [{
        documentBase64: Buffer.from(document).toString('base64'),
        name: signingRequest.documentName,
        fileExtension: 'pdf',
        documentId: '1'
      }],
      recipients: {
        signers: signingRequest.recipients.map(recipient => ({
          email: recipient.email,
          name: recipient.name,
          recipientId: recipient.recipientId,
          routingOrder: '1',
          tabs: {
            signHereTabs: [{
              xPosition: '100',
              yPosition: '100',
              documentId: '1',
              pageNumber: '1'
            }]
          }
        }))
      },
      status: 'sent'
    };

    // Create and send the envelope
    const envelope = await envelopesApi.createEnvelope(config.accountId, {
      envelopeDefinition
    });

    return envelope.envelopeId;
  } catch (error) {
    console.error('Error sending DocuSign request:', error);
    throw new Error('Failed to send DocuSign request');
  }
};
