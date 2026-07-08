import Script from "next/script";

/**
 * 网站分析统计组件
 *
 * 支持 Google Analytics 和百度统计
 * 从环境变量读取配置，未配置时不加载对应脚本
 *
 * 使用方式：在 app/layout.tsx 中引入即可
 */
export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const baiduId = process.env.NEXT_PUBLIC_BAIDU_TONGJI_ID;

  return (
    <>
      {/* Google Analytics (GA4) */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* 百度统计 */}
      {baiduId && (
        <Script id="baidu-tongji" strategy="afterInteractive">
          {`
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?${baiduId}";
              var s = document.getElementsByTagName("script")[0];
              s.parentNode.insertBefore(hm, s);
            })();
          `}
        </Script>
      )}
    </>
  );
}
