export const smsEndpoints = {
  likeToLike: 'https://api.sms.ir/v1/send/likeToLike',
  bulk: 'https://api.sms.ir/v1/send/bulk',
  verify: 'https://api.sms.ir/v1/send/verify',
  url: (username, password, line, mobile, smsText) =>
    `https://api.sms.ir/v1/send?username=${username}&password=${password}&line=${line}&mobile=${mobile}&text=${smsText}`,
};
