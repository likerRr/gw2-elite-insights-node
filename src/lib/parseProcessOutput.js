export const parseProcessOutput = (message) => {
  const successMatch = message.match(/Parsing Successful - (.+?):/);

  if (successMatch) {
    return {
      filePath: successMatch[1],
      isSuccess: true,
    };
  }

  const failureMatch = message.match(/Parsing Failure - (.+?):/);

  if (failureMatch) {
    return {
      filePath: failureMatch[1],
      isSuccess: false,
    };
  }

  return null;
}
