const fs = require('fs');
const path = require('path');
const utils = require('./utils');

const THREADS_DATA_FOLDER = path.resolve('./.data');

function loadJSONIfPossible(file, def = {}) {
  if (fs.existsSync(file)) {
    return utils.tryParse(file, def);
  }
  return def;
}

function saveJSON(file, json) {
  return utils.writeJSON(file, json);
}

function setStringSetGet(obj) {
  obj.set = (key, val) => obj[key.toString()] = val;
  obj.get = (key, val) => obj[key.toString()];
}

class ThreadsTracker{
  constructor(folder) {
    this.threadsFile = path.resolve(folder, 'threads');
    this.postsFile = path.resolve(folder, 'posts');

    this.threads = loadJSONIfPossible(this.threadsFile);
    setStringSetGet(this.threads);

    this.posts = loadJSONIfPossible(this.postsFile);
    setStringSetGet(this.posts);
  }

  addThread(id, date) {
    this.threads.set(id, { id, date, lastPostId: id });
    this.addPost(id, date, id);
  }

  getThread(replyId) {
    let thread = this.threads.get(replyId);
    if(!thread) {
      const post = this.posts.get(replyId);
      if(!post) {
        return false;
      }
      thread = this.threads.get(post.threadId);
    }
    return thread;
  }

  addPost(id, date, replyId) {
    const thread = this.getThread(replyId);
    if(!thread) {
      return false;
    }

    thread.date = Math.max(thread.date, date);
    thread.lastPostId = Math.max(thread.lastPostId, id);
    this.posts.set(id, { id, date, threadId: thread.id });
  }

  getTopThreads(n = 10) {
    return Object.values(this.threads)
      .filter(v => typeof v === 'object')
      .sort((a, b) => a.date < b.date)
      .slice(-n);
  }

  log() {
    console.log(this.threads);
    console.log(this.posts);
  }
  save() {
    saveJSON(this.threadsFile, this.threads);
    saveJSON(this.postsFile, this.posts);
  }
}

module.exports = new ThreadsTracker(THREADS_DATA_FOLDER);
