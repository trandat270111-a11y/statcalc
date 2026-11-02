/**
 * StatCalc Pro - Offline Service Worker
 * Cho phép ứng dụng hoạt động 100% offline ngay cả khi không có kết nối mạng
 */

const CACHE_NAME = 'statcalc-pro-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './assets/icon-64.png',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './vendor/xlsx.full.min.js',
    './vendor/chart.umd.min.js',
    './js/statistics.js',
    './js/spreadsheet.js',
    './js/excel.js',
    './js/charts.js',
    './js/app.js',
    './sample_data/bang_diem_hoc_sinh.csv',
    './sample_data/khao_sat_luong.csv'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).catch(() => {
                // Nếu offline và yêu cầu trang HTML, trả về index.html từ cache
                if (e.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
