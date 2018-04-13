Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class to maintain an item stored on the tangle.
 */
class StorageItem {
    constructor(id, data, tag, attachmentTimestamp, bundleHash, transactionHashes) {
        this.id = id;
        this.data = data;
        this.tag = tag;
        this.attachmentTimestamp = attachmentTimestamp;
        this.bundleHash = bundleHash;
        this.transactionHashes = transactionHashes;
    }
}
exports.StorageItem = StorageItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RvcmFnZS9zdG9yYWdlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBSUE7O0dBRUc7QUFDSDtJQVFJLFlBQVksRUFBUSxFQUFFLElBQVksRUFBRSxHQUFRLEVBQUUsbUJBQTJCLEVBQUUsVUFBZ0IsRUFBRSxpQkFBeUI7UUFDbEgsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztRQUMvQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7SUFDL0MsQ0FBQztDQUNKO0FBaEJELGtDQWdCQyJ9