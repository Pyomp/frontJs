declare type Describe = { title: string; callback: function };

declare function describe(title: string, callback: function);

declare type Test = { title: string; callback: function };
declare function test(title: string, callback: function);
declare function it(title: string, callback: function);

declare type Expect = import("./modules/Expect.js").Expect;

declare function expect(value: any): Expect;

declare type TestConfig = {
  maxUnitTestDuration: number;
  maxSimultaneousRunningTest: number;
  foldersToBeIgnored: string[];
};

declare type WsRequest = {
  command: string;
  data: any;
};
