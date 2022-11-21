export const retrySync = async (
  functionToRetry: () => Promise<any>,
  isSuccessHandler: (input: any) => boolean,
  times: number = 3,
  interval: number,
  incrementRatio: number
) => {
  let retryCount = 0;
  const repeatThis = async () => {
    console.log("Calling function, times:", retryCount + 1);
    const isSuccess = isSuccessHandler(await functionToRetry());
    retryCount++;
    if (isSuccess) {
      return true;
    } else {
      if (retryCount < times) {
        repeatThis();
      } else {
        return false;
      }
    }
  };
};
