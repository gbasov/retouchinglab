app = app || {};
app.modules = app.modules || {};

app.modules.loader = {
    queue: {},
    processing: false,
    findAndLoad: function(imageCb) {
        var _this = this;
        $('[data-load-image]').each(function(i, el) {
            var $el = $(el);
            var priority = $el.data('priority') || 0;
            if (!_this.queue.hasOwnProperty(priority)) {
                _this.queue[priority] = {tasks: [], cb: null};
            }

            _this.queue[priority].tasks.push({
                url: $el.data('load-image'),
                $el: $el,
                cb: imageCb
            });
        });
        _this.loadNext();
    },
    loadNext: function() {
        var _this = this;

        _this.processing = true;

        if (!Object.keys(this.queue).length) {
            _this.processing = false;
            return;
        }

        var priority = this._minKey(this.queue);
        var tasks = this.queue[priority].tasks;
        var queueCb = this.queue[priority].cb;
        var tasksLeft = tasks.length;

        tasks.forEach(function(task) {
            var img = new Image();
            img.src = task.url;
            img.onload = function() {
                tasksLeft--;

                if (task.cb) {
                    task.cb(task.$el);
                }

                if (tasksLeft <= 0) {
                    if (queueCb) {
                        queueCb()
                    }

                    delete _this.queue[priority];
                    _this.loadNext();
                }
            };
        });
    },

    _minKey: function(obj) {
        return Math.min.apply(Math,
            Object.keys(obj).map(function(i) { return parseInt(i); })
        );
    }
};
