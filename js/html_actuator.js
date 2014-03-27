function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.tweetButton      = document.querySelector('.tweet');

  this.score = 0;
  this.level = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if ( tile.value > this.level ) this.level = tile.value;

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.innerHTML = function( n ) {
    for ( i = 0; n > 1; ++ i, n >>= 1 );
    return [
        null, '拖延', '熬夜', '构思', '规划', '建模', 
        '写代码', '集成','需求<br />变更', '除错', '通宵', '上线'
        ][i];
  }( tile.value );

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? 
    "在故事的最后<br />项目终于得以问世<br />之前所付出的一切辛苦"
    + "<br />在这一刻看来都值了" : function( n ) {
      for ( i = 0; n > 4; ++ i, n >>= 1 );
      return [ 
        "由于长期熬夜的生活<br />此时此刻<br />你终于再也无法醒来了",
        "脑中一片混乱<br />你决定忘记这个项目<br />从明天开始<br />去摆摊卖大饼",
        "你仍未知道<br />那天所想出的项目<br />该如何下手",
        "数据结构 视图<br />动态规划 解耦<br />面对这千丝万缕的联系<br />"
          + "你决定还是算了",
        "你突然意识到<br />以自己的技术实力<br />计划中的那些功能<br />根本无法实现",
        "一段时间之后<br />你惊讶的发现<br />自己完成的代码<br />和系统竟完全不兼容",
        "你衷心的希望<br />所有想一出是一出<br />乱改需求的人<br />都他妈 "
          + "<span style=\"font-size:54px;color:#cc3333\">死ね！</span>",
        "BUG<br />还是 BUG<br />你引发了更多的 BUG<br />终于被淹没在虫海之中",
        "太阳升起之后<br />你因通宵而猝死的消息<br />出现在各大网站之上<br />"
          + "随后又被飞速的忘记",
        ][i];
    }( this.level );
  var tweet = won ? '项目终于得以问世' : '却还是出师未捷身先死';

  this.tweetButton.target = "_blank";
  this.tweetButton.href = 
    "http://service.weibo.com/share/share.php?url=http://git.io/coder&appkey=&"
    + "title=我在「%232048%23 : 请好好珍惜你身边的每一个程序员」中得到了 " + this.score
    + " 分，" + tweet + "。&pic=&ralateUid=&language=zh_cn";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].innerHTML = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
