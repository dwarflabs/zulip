set_global('$', global.make_zjquery());
set_global('i18n', global.stub_i18n);

add_dependencies({
    XDate: 'node_modules/xdate/src/xdate.js',
});

var timerender = require('js/timerender.js');

(function test_render_now_returns_today() {
    var today = new XDate(1555091573000); // Friday 4/12/2019 5:52:53 PM (UTC+0)
    var expected = {
        time_str: i18n.t('Today'),
        formal_time_str: 'Friday, April 12, 2019',
        needs_update: true,
    };
    var actual = timerender.render_now(today, today);
    assert.equal(expected.time_str, actual.time_str);
    assert.equal(expected.formal_time_str, actual.formal_time_str);
    assert.equal(expected.needs_update, actual.needs_update);
}());

(function test_render_now_returns_yesterday() {
    var today = new XDate(1555091573000); // Friday 4/12/2019 5:52:53 PM (UTC+0)
    var yesterday = today.clone().addDays(-1);
    var expected = {
        time_str: i18n.t('Yesterday'),
        formal_time_str: 'Thursday, April 11, 2019',
        needs_update: true,
    };
    var actual = timerender.render_now(yesterday, today);
    assert.equal(expected.time_str, actual.time_str);
    assert.equal(expected.formal_time_str, actual.formal_time_str);
    assert.equal(expected.needs_update, actual.needs_update);
}());

(function test_render_now_returns_year() {
    var today = new XDate(1555091573000); // Friday 4/12/2019 5:52:53 PM (UTC+0)
    var year_ago = today.clone().addYears(-1);
    var expected = {
        time_str: 'Apr 12, 2018',
        formal_time_str: 'Thursday, April 12, 2018',
        needs_update: false,
    };
    var actual = timerender.render_now(year_ago, today);
    assert.equal(expected.time_str, actual.time_str);
    assert.equal(expected.formal_time_str, actual.formal_time_str);
    assert.equal(expected.needs_update, actual.needs_update);
}());

(function test_render_now_returns_month_and_day() {
    var today = new XDate(1555091573000); // Friday 4/12/2019 5:52:53 PM (UTC+0)
    var three_months_ago = today.clone().addMonths(-3, true);
    var expected = {
        time_str: 'Jan 12',
        formal_time_str: 'Saturday, January 12, 2019',
        needs_update: false,
    };
    var actual = timerender.render_now(three_months_ago, today);
    assert.equal(expected.time_str, actual.time_str);
    assert.equal(expected.formal_time_str, actual.formal_time_str);
    assert.equal(expected.needs_update, actual.needs_update);
}());

(function test_render_now_returns_year_with_year_boundary() {
    var today = new XDate(1555091573000); // Friday 4/12/2019 5:52:53 PM (UTC+0)
    var three_months_ago = today.clone().addMonths(-6, true);
    var expected = {
        time_str: 'Oct 12, 2018',
        formal_time_str: 'Friday, October 12, 2018',
        needs_update: false,
    };
    var actual = timerender.render_now(three_months_ago, today);
    assert.equal(expected.time_str, actual.time_str);
    assert.equal(expected.formal_time_str, actual.formal_time_str);
    assert.equal(expected.needs_update, actual.needs_update);
}());

(function test_render_date_renders_time_html() {
    var today = new XDate(1555091573000); // Friday 4/12/2019 5:52:53 PM (UTC+0)
    var message_time  = today.clone();
    var expected_html = i18n.t('Today');

    var attrs = new Dict();
    var span_stub = $('<span />');

    span_stub.attr = function (name, val) {
        attrs.set(name, val);
        return span_stub;
    };

    span_stub.append = function (str) {
        span_stub.html(str);
        return span_stub;
    };

    var actual = timerender.render_date(message_time, undefined, today);
    assert.equal(expected_html, actual.html());
    assert.equal(attrs.get('title'), 'Friday, April 12, 2019');
    assert.equal(attrs.get('class'), 'timerender0');
}());

(function test_render_date_renders_time_above_html() {
    var today = new XDate(1555091573000); // Friday 4/12/2019 5:52:53 PM (UTC+0)
    var message_time = today.clone();
    var message_time_above = today.clone().addDays(-1);

    var span_stub = $('<span />');

    var appended_val;
    span_stub.append = function (val) {
        appended_val = val;
        return span_stub;
    };

    var expected = [
        '<i class="date-direction icon-vector-caret-up"></i>',
        i18n.t('Yesterday'),
        '<hr class="date-line">',
        '<i class="date-direction icon-vector-caret-down"></i>',
        i18n.t('Today'),
    ];

    timerender.render_date(message_time, message_time_above, today);
    assert.deepEqual(appended_val, expected);
}());

(function test_get_full_time() {
    var timestamp = 1495091573; // 5/18/2017 7:12:53 AM (UTC+0)
    var expected = '2017-05-18T07:12:53Z'; // ISO 8601 date format
    var actual = timerender.get_full_time(timestamp);
    assert.equal(expected, actual);
}());

(function test_absolute_time_12_hour() {
    set_global('page_params', {
        twenty_four_hour_time: false,
    });

    // timestamp with hour > 12
    var timestamp = 1555091573000; // 4/12/2019 5:52:53 PM (UTC+0)
    var expected = 'Apr 12, 2019 05:52 PM';
    var actual = timerender.absolute_time(timestamp);
    assert.equal(expected, actual);

    // timestamp with hour < 12
    timestamp = 1495091573000; // 5/18/2017 7:12:53 AM (UTC+0)
    expected = 'May 18, 2017 07:12 AM';
    actual = timerender.absolute_time(timestamp);
    assert.equal(expected, actual);
}());

(function test_absolute_time_24_hour() {
    set_global('page_params', {
        twenty_four_hour_time: true,
    });

    // timestamp with hour > 12
    var timestamp = 1555091573000; // 4/12/2019 17:52:53 (UTC+0)
    var expected = 'Apr 12, 2019 17:52';
    var actual = timerender.absolute_time(timestamp);
    assert.equal(expected, actual);

    // timestamp with hour < 12
    timestamp = 1495091573000; // 5/18/2017 7:12:53 AM (UTC+0)
    expected = 'May 18, 2017 07:12';
    actual = timerender.absolute_time(timestamp);
    assert.equal(expected, actual);
}());

(function test_set_full_datetime() {
    var message = {
        timestamp: 1495091573, // 5/18/2017 7:12:53 AM (UTC+0)
    };
    var time_element = $('<span/>');
    var attrs = new Dict();

    time_element.attr = function (name, val) {
        attrs.set(name, val);
        return time_element;
    };

    var expected = '5/18/2017 7:12:53 AM (UTC+0)';
    timerender.set_full_datetime(message, time_element);
    var actual = attrs.get('title');
    assert.equal(expected, actual);
}());

(function test_last_seen_status_from_date() {
    // Set base_dateto to March 1 2016 12.30 AM (months are zero based)
    var base_date = new XDate(2016, 2, 1, 0, 30);

    function assert_same(modifier, expected_status) {
        var past_date = base_date.clone();
        past_date = modifier(past_date);
        var actual_status = timerender.last_seen_status_from_date(past_date, base_date);
        assert.equal(actual_status, expected_status);
    }

    assert_same(function (d) { return d.addSeconds(-20); },
                i18n.t("Last seen just now"));

    assert_same(function (d) { return d.addMinutes(-1); },
                i18n.t("Last seen just now"));

    assert_same(function (d) { return d.addMinutes(-2); },
                i18n.t("Last seen just now"));

    assert_same(function (d) { return d.addMinutes(-30); },
                i18n.t("Last seen 30 minutes ago"));

    assert_same(function (d) { return d.addHours(-1); },
                i18n.t("Last seen an hour ago"));

    assert_same(function (d) { return d.addHours(-2); },
                i18n.t("Last seen 2 hours ago"));

    assert_same(function (d) { return d.addHours(-20); },
                i18n.t("Last seen 20 hours ago"));

    assert_same(function (d) { return d.addDays(-1); },
                i18n.t("Last seen yesterday"));

    assert_same(function (d) { return d.addDays(-2); },
                i18n.t("Last seen on Feb 28"));

    assert_same(function (d) { return d.addDays(-61); },
                i18n.t("Last seen on Dec 31"));

    assert_same(function (d) { return d.addDays(-300); },
                i18n.t("Last seen on May 06"));

    assert_same(function (d) { return d.addDays(-366); },
                i18n.t("Last seen on Mar 01, 2015"));

    assert_same(function (d) { return d.addYears(-3); },
                i18n.t("Last seen on Mar 01, 2013"));

}());
