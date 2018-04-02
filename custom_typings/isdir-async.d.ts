declare module 'isdir-async' {
  module isDirectory {
  }

  function isDirectory(dirname: string): Promise<boolean>;

  export = isDirectory;
}
