import fs from "fs/promises";
import os from "os";
import path from "path";
import { getConfig } from "../src/Configuration";

describe("Configuration is a module that", () => {
  describe("has a method `getConfig` that", () => {
    let tmpDir: string;
    let mockConfigPath: string;

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "utilities-notifier-"));
      mockConfigPath = path.join(tmpDir, "config.json");

      spyOn(console, "error");
      spyOn(process, "exit").and.callFake((() => {}) as any);
    });

    describe("when a valid --config path is passed to the process", () => {
      let originalArgv;
      let mockConfigData;

      beforeEach(async () => {
        originalArgv = process.argv;
        Object.defineProperty(process, "argv", {
          value: ["node", "index.js", `--config=${mockConfigPath}`],
        });
      });

      afterEach(() => {
        Object.defineProperty(process, "argv", {
          value: originalArgv,
        });
      });

      describe("and config.json contains an object with all required keys", () => {
        beforeEach(async () => {
          mockConfigData = JSON.stringify({
            plaid: {
              institutionAlias: "chase",
              accountId: "123",
            },
            splitwise: {
              consumerKey: "123",
              consumerSecret: "abc",
              groupId: "123",
              payerId: "123",
              owerId: "123",
            },
          });

          await fs.writeFile(mockConfigPath, mockConfigData);
        });

        it("should return the config object", () => {
          const config = getConfig();
          expect(config).toEqual(
            jasmine.objectContaining({
              plaid: jasmine.any(Object),
              splitwise: jasmine.any(Object),
            })
          );
        });
      });

      describe("and config.json contains a malformed object", () => {
        beforeEach(async () => {
          mockConfigData = `:${JSON.stringify({
            plaid: {
              institutionAlias: "chase",
              accountId: "123",
            },
            splitwise: {
              consumerKey: "123",
              consumerSecret: "abc",
              groupId: "123",
              payerId: "123",
              owerId: "123",
            },
          })}`;

          await fs.writeFile(mockConfigPath, mockConfigData);
        });

        it("should log an error message and exit", () => {
          getConfig();
          expect(console.error).toHaveBeenCalledWith("Invalid configuration:");
          expect(process.exit).toHaveBeenCalledWith(1);
        });
      });

      describe("and config.json contains an object without all required keys", () => {
        beforeEach(async () => {
          mockConfigData = JSON.stringify({
            plaid: {
              institutionAlias: "chase",
              accountId: "123",
            },
          });

          await fs.writeFile(mockConfigPath, mockConfigData);
        });

        it("should log an error message and exit", () => {
          getConfig();
          expect(console.error).toHaveBeenCalledWith("Invalid configuration:");
          expect(process.exit).toHaveBeenCalledWith(1);
        });
      });
    });

    describe("when an invalid --config path is passed to the process", () => {
      it("should log an error message and exit", () => {
        getConfig();
        expect(console.error).toHaveBeenCalledWith(
          "Could not read configuration from file:"
        );
        expect(process.exit).toHaveBeenCalledWith(1);
      });
    });
  });
});
