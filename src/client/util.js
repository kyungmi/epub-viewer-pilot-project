export function measureSync(run, message, ...optionalParams) {
  const startTime = new Date().getTime();
  run();
  console.log(`${message}`, ...optionalParams, `- (${(new Date().getTime() - startTime)}ms)`);
}

export async function measure(promise, message, ...optionalParams) {
  const startTime = new Date().getTime();
  await promise;
  console.log(`${message}`, ...optionalParams, `- (${(new Date().getTime() - startTime)}ms)`);
}

export function getRootElement() {
  return document.getElementById('content');
}
