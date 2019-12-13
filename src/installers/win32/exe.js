import open from 'open';

export default async (filePath) => open(filePath, { wait: false });
