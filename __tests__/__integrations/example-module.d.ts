declare const exampleModule: {
  join: {
    (a: string, b: string): string;
    (a: number, b: number): number;
    (a: string, b: number): never;
    (a: number, b: string): never;
  };
};

export default exampleModule;
