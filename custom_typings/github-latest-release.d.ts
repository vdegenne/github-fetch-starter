declare module 'github-latest-release' {
  function latest(user: string, repo: string): Promise<any>;

  export = latest;
}
