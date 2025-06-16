<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html>
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            color: #333;
            line-height: 1.6;
          }

          .navbar {
            background-color: #002147;
            padding: 1rem 0;
            margin-bottom: 2rem;
          }

          .navbar-brand {
            color: white;
            font-size: 1.5rem;
            font-weight: 600;
            text-decoration: none;
            margin-left: 2rem;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
          }

          .header {
            padding: 2rem 0 1rem 0;
            border-bottom: 1px solid #e9ecef;
          }

          .breadcrumb {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
          }

          .breadcrumb h1 {
            margin: 0;
            font-size: 2rem;
            color: #002147;
            font-weight: 600;
          }

          .breadcrumb .separator {
            margin: 0 1rem;
            color: #6c757d;
            font-size: 1.2rem;
          }

          .breadcrumb h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #1a4480;
            font-weight: 500;
          }
          
          .stats {
            background: #f8f9fa;
            padding: 1rem 2rem;
            margin: 1rem 0;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
          }

          .stats-item {
            display: flex;
            align-items: center;
            margin: 0.5rem 0;
          }

          .stats-label {
            font-weight: 600;
            color: #002147;
            margin-right: 0.5rem;
          }

          .stats-value {
            color: #1a4480;
            font-weight: 500;
          }

          .content {
            padding: 2rem 0;
          }

          .row {
            display: flex;
            flex-wrap: wrap;
            margin: 0 -1rem;
          }

          .col {
            flex: 1;
            padding: 0 1rem;
            min-width: 300px;
          }
          
          .url-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .url-item {
            display: flex;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f1f3f4;
          }

          .url-item:last-child {
            border-bottom: none;
          }

          .url-arrow {
            color: #6c757d;
            margin-right: 0.5rem;
            font-size: 1.2rem;
          }

          .url-link {
            color: #1a4480;
            text-decoration: none;
            font-weight: 500;
            flex: 1;
          }

          .url-link:hover {
            color: #002147;
            text-decoration: underline;
          }

          .url-meta {
            font-size: 0.85rem;
            color: #6c757d;
            margin-left: 1rem;
          }

          .section-title {
            color: #002147;
            font-size: 1.25rem;
            font-weight: 600;
            margin: 2rem 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e9ecef;
          }
          
          .lastmod {
            color: #6c757d;
            font-size: 0.9rem;
          }
          
          .changefreq {
            color: #495057;
            font-size: 0.9rem;
            text-transform: capitalize;
          }
          
          .priority {
            color: #495057;
            font-size: 0.9rem;
            font-weight: 500;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 2rem;
            text-align: center;
            color: #6c757d;
            font-size: 0.9rem;
            border-top: 1px solid #e9ecef;
            margin-top: 2rem;
          }

          .footer a {
            color: #1a4480;
            text-decoration: none;
          }

          .footer a:hover {
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .container {
              margin: 0 1rem;
              padding: 0 1rem;
            }

            .navbar-brand {
              margin-left: 1rem;
            }

            .breadcrumb {
              flex-direction: column;
              align-items: flex-start;
            }

            .breadcrumb .separator {
              display: none;
            }

            .breadcrumb h1 {
              font-size: 1.5rem;
            }

            .breadcrumb h2 {
              font-size: 1.25rem;
            }

            .stats {
              flex-direction: column;
              align-items: flex-start;
            }

            .row {
              margin: 0;
            }

            .col {
              padding: 0;
              min-width: auto;
            }

            .url-meta {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <nav class="navbar">
          <div class="navbar-brand">IFLA Standards</div>
        </nav>

        <div class="container">
          <header class="header">
            <div class="breadcrumb">
              <h1>IFLA Standards</h1>
              <span class="separator">></span>
              <h2>Site Map</h2>
            </div>

            <div class="stats">
              <div class="stats-item">
                <span class="stats-label">Total URLs:</span>
                <span class="stats-value"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span>
              </div>
              <div class="stats-item">
                <span class="stats-label">Last Updated:</span>
                <span class="stats-value">
                  <xsl:choose>
                    <xsl:when test="sitemap:urlset/sitemap:url[1]/sitemap:lastmod">
                      <xsl:value-of select="sitemap:urlset/sitemap:url[1]/sitemap:lastmod"/>
                    </xsl:when>
                    <xsl:otherwise>Recently</xsl:otherwise>
                  </xsl:choose>
                </span>
              </div>
            </div>
          </header>

          <main class="content">
            <div class="row">
              <div class="col">
                <h3 class="section-title">Site Pages</h3>
                <nav>
                  <ul class="url-list">
                    <xsl:for-each select="sitemap:urlset/sitemap:url">
                      <xsl:sort select="sitemap:loc"/>
                      <li class="url-item">
                        <span class="url-arrow">→</span>
                        <a href="{sitemap:loc}" class="url-link">
                          <xsl:choose>
                            <xsl:when test="contains(sitemap:loc, '/docs/')">
                              <xsl:value-of select="substring-after(substring-after(sitemap:loc, '/docs/'), '/')"/>
                            </xsl:when>
                            <xsl:when test="substring-after(sitemap:loc, '://') != ''">
                              <xsl:variable name="path" select="substring-after(substring-after(sitemap:loc, '://'), '/')"/>
                              <xsl:choose>
                                <xsl:when test="$path = '' or $path = '/'">Home</xsl:when>
                                <xsl:otherwise><xsl:value-of select="$path"/></xsl:otherwise>
                              </xsl:choose>
                            </xsl:when>
                            <xsl:otherwise><xsl:value-of select="sitemap:loc"/></xsl:otherwise>
                          </xsl:choose>
                        </a>
                        <xsl:if test="sitemap:lastmod">
                          <span class="url-meta">
                            Updated: <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                          </span>
                        </xsl:if>
                      </li>
                    </xsl:for-each>
                  </ul>
                </nav>
              </div>
            </div>
          </main>
        </div>

        <footer class="footer">
          <p>
            This is an XML sitemap for search engines and site navigation.
            <a href="https://www.sitemaps.org/" target="_blank">Learn more about XML sitemaps</a>
          </p>
          <p>
            <small>
              Copyright © <xsl:value-of select="format-dateTime(current-dateTime(), '[Y0001]')"/>
              International Federation of Library Associations and Institutions (IFLA)
            </small>
          </p>
        </footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
