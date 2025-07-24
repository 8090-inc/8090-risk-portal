/**
 * Queue for serializing relationship updates to prevent race conditions
 */
export class RelationshipUpdateQueue {
  private queue: Map<string, Promise<void>> = new Map();
  
  /**
   * Enqueue an update operation for a specific entity
   * Ensures updates to the same entity are serialized
   */
  async enqueue(key: string, updateFn: () => Promise<void>): Promise<void> {
    // Wait for any pending update on this entity
    const pending = this.queue.get(key);
    if (pending) {
      console.log(`Waiting for pending update on ${key}`);
      await pending;
    }
    
    // Execute new update
    const promise = updateFn()
      .finally(() => {
        this.queue.delete(key);
      });
    
    this.queue.set(key, promise);
    return promise;
  }
  
  /**
   * Check if an entity has a pending update
   */
  hasPendingUpdate(key: string): boolean {
    return this.queue.has(key);
  }
  
  /**
   * Get the number of pending updates
   */
  get pendingCount(): number {
    return this.queue.size;
  }
  
  /**
   * Clear all pending updates (use with caution)
   */
  clear(): void {
    this.queue.clear();
  }
}

// Singleton instance for the application
export const relationshipQueue = new RelationshipUpdateQueue();