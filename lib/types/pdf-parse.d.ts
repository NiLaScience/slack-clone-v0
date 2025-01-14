declare module 'pdf-parse' {
  function parse(buffer: Buffer | ArrayBuffer): Promise<{ text: string }>
  export = parse
} 