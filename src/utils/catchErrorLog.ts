export function catchErrorLog(error: any) {
  console.trace(`🐛`);
  console.log(error);
  try { console.log(JSON.stringify(error, null, 4)); } catch (error) { }
}
