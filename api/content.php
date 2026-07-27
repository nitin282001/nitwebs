<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

$defaultContent = [
    "hero" => [
        "badge" => "AI-first software development",
        "title" => "Nitwebs",
        "desc" => "We engineer AI products, scalable software, SaaS platforms, mobile apps, and automation systems for ambitious companies worldwide."
    ],
    "aboutUs" => [
        "badge" => "About Us",
        "title" => "We Engineer the Future of Software",
        "paragraph1" => "At Nitwebs, we combine world-class engineering, artificial intelligence, and strategic design to construct premium digital products. Our team builds secure, scalable platforms that resolve complex operational challenges for high-growth enterprises globally.",
        "paragraph2" => "From custom SaaS architectures and automated system integrations to cutting-edge AI models, we embed quality-first engineering into every line of code. We partner with ambitious organizations to deliver measurable, transformative outcomes.",
        "ctaText" => "Learn More"
    ],
    "services" => [
        [
            "icon" => "Cpu",
            "title" => "AI Engineering",
            "desc" => "Build intelligent products powered by AI—from custom AI agents and business automation to LLM integrations, chatbots, document intelligence, and workflow optimization."
        ],
        [
            "icon" => "Layers",
            "title" => "Custom Software & SaaS",
            "desc" => "Develop enterprise-grade platforms tailored to your business. We build CRMs, ERPs, SaaS products, portals, dashboards, and internal systems that scale effortlessly."
        ],
        [
            "icon" => "Globe",
            "title" => "Web & Mobile Applications",
            "desc" => "Create fast, secure, and engaging digital experiences with responsive websites, progressive web apps, and cross-platform mobile applications built for performance."
        ],
        [
            "icon" => "Workflow",
            "title" => "Automation & System Integration",
            "desc" => "Eliminate repetitive work by connecting your existing tools through APIs, payment gateways, CRM integrations, ERP systems, messaging platforms, and automated workflows."
        ],
        [
            "icon" => "Cloud",
            "title" => "Cloud Infrastructure & DevOps",
            "desc" => "Deploy confidently with secure, scalable cloud architecture, CI/CD pipelines, Docker containers, database optimization, monitoring, and high-availability infrastructure."
        ],
        [
            "icon" => "Palette",
            "title" => "UI/UX & Product Design",
            "desc" => "Design intuitive digital experiences that users love. From research and wireframes to polished interfaces, we create products that are beautiful, functional, and conversion-focused."
        ]
    ],
    "process" => [
        [ "stage" => "01", "title" => "Discovery", "desc" => "We understand your business goals, users, and requirements to create the right technology strategy." ],
        [ "stage" => "02", "title" => "Architecture & Design", "desc" => "Our team designs user interfaces and scalable system architecture before writing code." ],
        [ "stage" => "03", "title" => "Agile Development", "desc" => "We build using modern tech stacks with continuous integration, frequent updates, and clean code." ],
        [ "stage" => "04", "title" => "Launch & Scaling", "desc" => "After testing and deployment, we monitor performance, optimize systems, and support your growth." ]
    ],
    "whyUs" => [
        [ "title" => "AI-Driven Productivity", "desc" => "Modern AI tooling speeds up development by 3x." ],
        [ "title" => "Enterprise Architecture", "desc" => "Built to scale smoothly as user base grows." ],
        [ "title" => "Transparent Delivery", "desc" => "Clear roadmaps and regular milestone updates." ]
    ],
    "showcase" => [],
    "testimonials" => [],
    "faqs" => [],
    "stats" => [
        [ "value" => "99.9", "suffix" => "%", "label" => "Client Satisfaction" ],
        [ "value" => "50", "suffix" => "+", "label" => "Projects Delivered" ],
        [ "value" => "10", "suffix" => "+", "label" => "Countries Served" ]
    ],
    "brands" => [],
    "theme" => [
        "primaryColor" => "#6366f1"
    ],
    "logo" => [
        "mode" => "text",
        "text" => "Nitwebs"
    ],
    "seo" => [
        "metaTitle" => "Nitwebs | AI-first Software Development & SaaS Solutions Company",
        "metaDescription" => "Nitwebs is an AI-first software development company building custom software, AI agents, mobile apps, and scalable SaaS platforms worldwide.",
        "metaKeywords" => "AI software development, SaaS engineering, custom software, AI agents, cloud infrastructure, mobile apps",
        "ogImage" => "",
        "canonicalUrl" => "https://nitwebs.com",
        "robots" => "index, follow",
        "googleVerification" => "",
        "bingVerification" => "",
        "googleAnalyticsId" => "",
        "structuredData" => "",
        "headerCode" => "",
        "footerCode" => ""
    ]
];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT data FROM site_content ORDER BY id ASC LIMIT 1");
    $row = $stmt->fetch();
    if ($row && !empty($row['data'])) {
        $decoded = json_decode($row['data'], true);
        if ($decoded && is_array($decoded) && isset($decoded['hero'])) {
            sendJSON($decoded);
        }
    }
    sendJSON($defaultContent);
}

if ($method === 'POST' || $method === 'PUT') {
    verifyAdminToken();
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        sendJSON(["message" => "Invalid JSON payload"], 400);
    }
    $json = json_encode($input, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
    $stmt = $pdo->query("SELECT id FROM site_content ORDER BY id ASC LIMIT 1");
    $existing = $stmt->fetch();
    
    if ($existing) {
        $uStmt = $pdo->prepare("UPDATE site_content SET data = ?, updated_at = NOW() WHERE id = ?");
        $uStmt->execute([$json, $existing['id']]);
    } else {
        $iStmt = $pdo->prepare("INSERT INTO site_content (data, updated_at) VALUES (?, NOW())");
        $iStmt->execute([$json]);
    }
    
    sendJSON(["content" => $input]);
}

sendJSON(["message" => "Method not allowed"], 405);
