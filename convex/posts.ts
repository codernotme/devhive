import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

// Define a query to get both the current user's and their friends' posts
export const get = query({
  args: {},
  handler: async (ctx, args) => {
    try {
      // Retrieve the authenticated user's identity
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new ConvexError("Unauthorized");
      }

      // Fetch the current user details using their Clerk ID
      const currentUser = await getUserByClerkId({
        ctx,
        clerkId: identity.subject,
      });

      if (!currentUser) {
        throw new ConvexError("User not found");
      }

      // Fetch posts from the current user
      const userPosts = await ctx.db
        .query("posts")
        .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
        .collect();

      // Fetch the friendships where the current user is either user1 or user2
      const friendshipsAsUser1 = await ctx.db
        .query("friends")
        .withIndex("by_user1", (q) => q.eq("user1", currentUser._id))
        .collect();

      const friendshipsAsUser2 = await ctx.db
        .query("friends")
        .withIndex("by_user2", (q) => q.eq("user2", currentUser._id))
        .collect();

      // Combine all friendships (whether the user is user1 or user2)
      const allFriendships = [...friendshipsAsUser1, ...friendshipsAsUser2];

      // Fetch posts for each friend in both cases (whether they are user1 or user2)
      const friendsPostsPromises = allFriendships.map(async (friendship) => {
        const friendId = friendship.user1.toString() === currentUser._id.toString()
          ? friendship.user2
          : friendship.user1;

        // Fetch all posts from the friend
        return ctx.db
          .query("posts")
          .withIndex("by_userId", (q) => q.eq("userId", friendId))
          .collect();
      });

      // Wait for all friend's posts to be fetched
      const friendsPostsArrays = await Promise.all(friendsPostsPromises);
      const friendsPosts = friendsPostsArrays.flat();

      // Combine user's and friends' posts
      const allPosts = [...userPosts, ...friendsPosts];

      // Sort all posts by creation time (newest first)
      allPosts.sort(
        (a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime()
      );

      // Fetch author details for each post
      const postsWithAuthors = await Promise.all(
        allPosts.map(async (post) => {
          const author = await ctx.db.get(post.userId);

          if (!author) {
            throw new ConvexError("Post author not found");
          }

          return {
            post,
            authorImage: author.imageUrl,
            authorName: author.username,
            isCurrentUser: post.userId.toString() === currentUser._id.toString(), // Check if the current user is the author
          };
        })
      );

      return postsWithAuthors;

    } catch (error) {
      // Handle and log errors for better debugging
      console.error("Error fetching posts:", error);
      throw new ConvexError("Failed to fetch posts");
    }
  },
});
