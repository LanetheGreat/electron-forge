import opn from 'opn';

export default async (filePath) => opn(filePath, { wait: false });
