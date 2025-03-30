import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { castFromScope } from "@selfxyz/core";

// For prod environment
// const DEFAULT_IDENTITY_VERIFICATION_HUB = "0x9AcA2112D34Ef021084264F6f5eef2a99a5bA7b1";
// For staging environment
const DEFAULT_IDENTITY_VERIFICATION_HUB = "0xDCAa9D9b8E8Bb5696c5d4b47da84aD37b8DEb9A8";
const DEFAULT_SCOPE = castFromScope('Self-Denver-Birthday');
const DEFAULT_ATTESTATION_ID = 1n;
const DEFAULT_TOKEN = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
const DEFAULT_OLDER_THAN_ENABLED = false;
const DEFAULT_OLDER_THAN = 18n;
const DEFAULT_FORBIDDEN_COUNTRIES_ENABLED = false;
const DEFAULT_FORBIDDEN_COUNTRIES_LIST_PACKED = [0n, 0n, 0n, 0n];
const DEFAULT_OFAC_ENABLED = [false, false, false];

const SelfHappyBirthdayModule = buildModule("SelfHappyBirthdayModule", (m) => {
  const identityVerificationHub = m.getParameter("identityVerificationHub", DEFAULT_IDENTITY_VERIFICATION_HUB);
  const scope = m.getParameter("scope", DEFAULT_SCOPE);
  const attestationId = m.getParameter("attestationId", DEFAULT_ATTESTATION_ID);
  const token = m.getParameter("token", DEFAULT_TOKEN);
  const olderThanEnabled = m.getParameter("olderThanEnabled", DEFAULT_OLDER_THAN_ENABLED);
  const olderThan = m.getParameter("olderThan", DEFAULT_OLDER_THAN);
  const forbiddenCountriesEnabled = m.getParameter("forbiddenCountriesEnabled", DEFAULT_FORBIDDEN_COUNTRIES_ENABLED);
  const forbiddenCountriesListPacked = m.getParameter("forbiddenCountriesListPacked", DEFAULT_FORBIDDEN_COUNTRIES_LIST_PACKED);
  const ofacEnabled = m.getParameter("ofacEnabled", DEFAULT_OFAC_ENABLED);
  const selfHappyBirthday = m.contract("SelfHappyBirthday", [
    identityVerificationHub,
    scope,
    attestationId,
    token,
    olderThanEnabled,
    olderThan,
    forbiddenCountriesEnabled,
    forbiddenCountriesListPacked,
    ofacEnabled
  ]);
  return { selfHappyBirthday };
});
export default SelfHappyBirthdayModule;