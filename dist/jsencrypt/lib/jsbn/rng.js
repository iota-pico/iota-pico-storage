Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
const rngServiceFactory_1 = require("@iota-pico/core/dist/factories/rngServiceFactory");
class SecureRandom {
    nextBytes(ba) {
        const rngService = rngServiceFactory_1.RngServiceFactory.instance().create("default");
        const arr = rngService.generate(ba.length);
        for (let i = 0; i < ba.length; ++i) {
            ba[i] = arr[i];
        }
    }
}
exports.SecureRandom = SecureRandom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2pzZW5jcnlwdC9saWIvanNibi9ybmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLG9CQUFvQjtBQUNwQix3RkFBcUY7QUFFckY7SUFDVyxTQUFTLENBQUMsRUFBWTtRQUN6QixNQUFNLFVBQVUsR0FBRyxxQ0FBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFbEUsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDakMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQixDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBVkQsb0NBVUMifQ==