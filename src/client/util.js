export async function measure(run, message, ...optionalParams) {
  const startTime = new Date().getTime();
  let result;
  if (typeof run === 'function') {
    result = run();
  } else {
    result = await run;
  }
  console.log(`${message}`, ...optionalParams, `- (${(new Date().getTime() - startTime)}ms)`);
  return result;
}

export function getRootElement() {
  return document.getElementById('content');
}
