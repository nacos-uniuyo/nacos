import type { RichTextDoc } from "@/db/json";

export const PROJECT_ARTICLES: Record<string, RichTextDoc> = {
  "campus-threat-monitor": {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Background and Challenge" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "University campuses present a unique wireless security environment. With hundreds of students, researchers, and visitors moving between lecture halls, laboratories, and outdoor quadrangles, wireless local area networks operate under persistent traffic loads. In the Faculty of Computing complex at the University of Uyo, open study areas and shared computing facilities frequently experience unauthorized wireless emissions.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Ad-hoc evil-twin access points, misconfigured cellular tethering nodes, and rogue Wi-Fi emitters pose immediate threats to credential integrity. When personal devices connect to counterfeit campus hotspots, student portal sessions and academic communications become vulnerable to interception. Campus Threat Monitor was developed to address this challenge without requiring expensive commercial network appliances or disruptive intrusion countermeasures.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Passive Sniffing Architecture" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The system is built upon a distributed array of low-power micro-controllers paired with directional high-gain antennas. These nodes operate entirely in passive monitor mode, cycling through IEEE 802.11 channels in both 2.4 GHz and 5 GHz bands. By restricting nodes strictly to packet ingestion, the monitoring grid remains undetectable and complies fully with institutional telecommunications guidelines.",
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Effective wireless perimeter defense does not require aggressive packet injection. Continuous passive beacon analysis surfaces spoofed identifiers and abnormal transmission power before user devices establish a handshake.",
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Captured beacon frames and probe requests undergo local cryptographic fingerprinting on each edge node. The edge firmware extracts Basic Service Set Identifiers (BSSIDs), transmission intervals, vendor Organizationally Unique Identifiers (OUIs), and Supported Rates elements. When an emitter broadcasts authorized campus network names with mismatched hardware signatures, the anomaly is flagged immediately.",
          },
        ],
      },
      {
        type: "image",
        attrs: {
          src: "/images/projects/threat-monitor-topology.svg",
          alt: "Campus Threat Monitor distributed sensor architecture",
          title: "Figure 1.0: Distributed sensor architecture and passive packet sniffing topology across faculty wings",
        },
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Coursework Standards and Laboratory Evaluation" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Developed by CYB 400L Group 3 as their capstone coursework submission for CYB 411, the project underwent rigorous bench testing in the Department of Cybersecurity laboratory. The evaluation criteria prioritized three core metrics:",
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Detection Latency: ",
                  },
                  {
                    type: "text",
                    text: "Identification of newly energized rogue access points within 4.2 seconds of initial beacon transmission.",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Zero Packet Interference: ",
                  },
                  {
                    type: "text",
                    text: "Absolute zero packet transmission from the sensor rig to ensure compliance with ethical monitoring standards.",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Low-Power Longevity: ",
                  },
                  {
                    type: "text",
                    text: "Sustained continuous operation exceeding 36 hours on secondary battery backup during faculty power transfers.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Faculty Attribution and Next Steps" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The project was supervised by faculty mentors in the Department of Cybersecurity and officially approved by the faculty moderation committee for inclusion in the NACOS permanent project archive. Ongoing work focuses on integrating automated signal triangulation across adjacent corridors, providing faculty network administrators with precise physical room coordinates for rogue emitters.",
          },
        ],
      },
    ],
  },

  "open-track": {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Transparent Governance for Computing Students" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Student leadership administrations carry significant responsibilities, managing developmental programs, academic bootcamps, infrastructure maintenance, and professional workshops. Historically, progress tracking was locked inside internal committee meetings, leaving students disconnected from executive commitments.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Open-Track was commissioned by the NACOS Software Directorate to establish a single, public source of truth for chapter governance. Every executive pledge is logged as a verifiable milestone with concrete deliverables, assigned directorate leads, and real-time status indicators.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Engineering and Architecture" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The platform is engineered as a modern, type-safe web application built with server-side rendered layouts, optimistic database mutations, and automated webhook synchronization from version control repositories. Deliverables requiring source code updates automatically link to public GitHub commits, guaranteeing verifiable accountability.",
          },
        ],
      },
      {
        type: "image",
        attrs: {
          src: "/images/projects/open-track-milestones.svg",
          alt: "Open-Track Executive Progress Board Interface",
          title: "Figure 1.0: Public milestone tracking and verified pull request synchronization interface",
        },
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "When student leadership commitments are documented in public with verifiable milestones, accountability ceases to be an abstract promise and becomes a tangible standard.",
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Long-term Maintenance and Handover" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Open-Track is designed to persist across executive sessions. With comprehensive documentation, clean schema definitions, and automated CI/CD checks, incoming student developer teams can maintain and expand the platform without losing historical session archives.",
          },
        ],
      },
    ],
  },

  "siwes-placement-matcher": {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Industrial Training and Career Readiness" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The Students Industrial Work Experience Scheme (SIWES) is a compulsory academic requirement for undergraduate computing students in Nigeria. Connecting hundreds of students to accredited technical firms across Akwa Ibom State and major commercial hubs has traditionally involved fragmented notice boards, manual applications, and uncertain response times.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "SIWES Placement Matcher was engineered to streamline this discovery and verification process. Developed as an advanced database and information systems project for INS 412, the platform connects verified student skill profiles with verified industry training openings.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Information Architecture and Matching Logic" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The platform models industry requirements against departmental curricula, factoring in specialized domains such as cloud engineering, network administration, database architecture, and cybersecurity. A weighted scoring engine recommends placements based on student course performance, geographic feasibility, and verified industry mentor availability.",
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Modern information systems should actively reduce friction in career transitions, pairing student academic preparation with authentic industry expectations.",
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Department Verification and Deployment" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Supervised within the Department of Information Systems, the pilot phase demonstrated a sixty percent reduction in placement verification overhead for departmental SIWES coordinators. The system maintains an active directory of verified technology partners across Nigeria.",
          },
        ],
      },
    ],
  },

  "lecture-hall-occupancy": {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Campus Space Allocation and Congestion" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Across the Faculty of Computing complex at the permanent site, lecture auditoriums and study centers experience sudden surges in attendance, particularly during revision weeks and joint faculty lectures. Students frequently spend valuable time walking between distant blocks only to find venues occupied or at maximum capacity.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The Lecture Hall Occupancy Sensor project was developed by Computer Science students under CSC 415 to provide real-time seating availability data to students and departmental timetabling officers.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Sensor Hardware and Privacy Preservation" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "A central requirement of the project was strict privacy preservation. Instead of optical video cameras, the hardware array utilizes low-cost passive infrared (PIR) motion sensors and ambient acoustic density sensors connected to ESP32 micro-controller boards. No identifiable student images or audio streams are ever captured or stored.",
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Smart campus hardware must prioritize student privacy by design. By deriving occupancy metrics from non-optical thermal and acoustic sensors, room utilization is accurately measured without surveillance.",
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Telemetry Protocol and Faculty Integration" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The sensor nodes broadcast lightweight JSON telemetry payloads over MQTT to a campus broker. The data feeds into the NACOS student portal, presenting clear, color-coded capacity indicators for each major auditorium across the faculty.",
          },
        ],
      },
    ],
  },
};
