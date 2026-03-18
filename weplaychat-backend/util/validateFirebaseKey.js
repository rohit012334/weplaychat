const validateAndFixPrivateKey = (privateKey) => {
  if (!privateKey) return { valid: false, error: "Private key is null or undefined" };

  if (typeof privateKey === "string") {
    try { privateKey = JSON.parse(privateKey); } 
    catch (e) { return { valid: false, error: `Failed to parse JSON: ${e.message}` }; }
  }

  if (typeof privateKey !== "object") 
    return { valid: false, error: `Private key must be an object, got ${typeof privateKey}` };

  const requiredFields = [
    "type","project_id","private_key_id","private_key",
    "client_email","client_id","auth_uri","token_uri"
  ];
  const missingFields = requiredFields.filter(f => !privateKey[f]);
  if (missingFields.length > 0) 
    return { valid: false, error: `Missing fields: ${missingFields.join(", ")}` };

  if (privateKey.type !== "service_account") 
    return { valid: false, error: `Invalid type "${privateKey.type}", expected "service_account"` };

  if (typeof privateKey.private_key !== "string" || 
      !privateKey.private_key.includes("-----BEGIN PRIVATE KEY-----")) 
    return { valid: false, error: `Invalid private_key format` };

  let fixedKey = { ...privateKey };
  fixedKey.private_key = fixedKey.private_key.replace(/\\n/g, "\n");

  return { valid: true, privateKey: fixedKey };
};

module.exports = validateAndFixPrivateKey;