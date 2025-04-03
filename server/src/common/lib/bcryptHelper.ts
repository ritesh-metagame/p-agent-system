import bcrypt from "bcryptjs";

interface IBcrypt {
  generateHash(input: string): Promise<string>;
  compareHash(input: string, userInput: string): Promise<boolean>;
}

class BcryptService {
  public static async generateHash(input: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(input, salt);
  }
  public static async compareHash(
    input: string,
    userInput: string
  ): Promise<boolean> {
    return await bcrypt.compare(input, userInput);
  }
}

export { BcryptService };
