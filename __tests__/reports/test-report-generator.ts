/**
 * Test Report Generator
 * Tạo báo cáo kiểm thử tự động theo format bảng kiểm thử
 */

interface TestCase {
    id: string
    description: string
    inputData?: string
    expectedResult: string
    actualResult: string
    status: 'Pass' | 'Fail'
    notes?: string
}

interface TestSuite {
    name: string
    testCases: TestCase[]
}

export class TestReportGenerator {
    private testSuites: TestSuite[] = []

    addTestSuite(suite: TestSuite) {
        this.testSuites.push(suite)
    }

    generateMarkdownReport(): string {
        let report = '# Báo Cáo Kiểm Thử Tự Động\n\n'
        report += `**Ngày tạo:** ${new Date().toLocaleDateString('vi-VN')}\n\n`

        this.testSuites.forEach(suite => {
            report += `## ${suite.name}\n\n`
            report += '| ID | Nội dung kiểm thử | Dữ liệu đầu vào | Đầu ra | Thực tế | Pass/Fail |\n'
            report += '|----|--------------------|------------------|---------|---------|----------|\n'

            suite.testCases.forEach(testCase => {
                report += `| ${testCase.id} | ${testCase.description} | ${testCase.inputData || ''} | ${testCase.expectedResult} | ${testCase.actualResult} | ${testCase.status} |\n`
            })

            report += '\n'
        })

        // Thống kê tổng quan
        const totalTests = this.testSuites.reduce((sum, suite) => sum + suite.testCases.length, 0)
        const passedTests = this.testSuites.reduce((sum, suite) =>
            sum + suite.testCases.filter(tc => tc.status === 'Pass').length, 0)
        const failedTests = totalTests - passedTests

        report += '## Thống Kê Tổng Quan\n\n'
        report += `- **Tổng số test cases:** ${totalTests}\n`
        report += `- **Passed:** ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)\n`
        report += `- **Failed:** ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)\n\n`

        return report
    }

    generateHTMLReport(): string {
        let html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo Cáo Kiểm Thử</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; flex: 1; }
        .stat-number { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .pass { color: #28a745; font-weight: bold; }
        .fail { color: #dc3545; font-weight: bold; }
        .suite-title { color: #333; margin-top: 30px; margin-bottom: 15px; }
        tr:hover { background-color: #f5f5f5; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Báo Cáo Kiểm Thử Tự Động</h1>
        <p>Ngày tạo: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</p>
    </div>
`

        // Thống kê
        const totalTests = this.testSuites.reduce((sum, suite) => sum + suite.testCases.length, 0)
        const passedTests = this.testSuites.reduce((sum, suite) =>
            sum + suite.testCases.filter(tc => tc.status === 'Pass').length, 0)
        const failedTests = totalTests - passedTests

        html += `
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${totalTests}</div>
            <div class="stat-label">Tổng Test Cases</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" style="color: #28a745">${passedTests}</div>
            <div class="stat-label">Passed</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" style="color: #dc3545">${failedTests}</div>
            <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${((passedTests / totalTests) * 100).toFixed(1)}%</div>
            <div class="stat-label">Success Rate</div>
        </div>
    </div>
`

        // Test suites
        this.testSuites.forEach(suite => {
            html += `<h2 class="suite-title">${suite.name}</h2>`
            html += `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nội dung kiểm thử</th>
                    <th>Dữ liệu đầu vào</th>
                    <th>Đầu ra</th>
                    <th>Thực tế</th>
                    <th>Pass/Fail</th>
                </tr>
            </thead>
            <tbody>
      `

            suite.testCases.forEach(testCase => {
                const statusClass = testCase.status === 'Pass' ? 'pass' : 'fail'
                html += `
                <tr>
                    <td>${testCase.id}</td>
                    <td>${testCase.description}</td>
                    <td>${testCase.inputData || '-'}</td>
                    <td>${testCase.expectedResult}</td>
                    <td>${testCase.actualResult}</td>
                    <td class="${statusClass}">${testCase.status}</td>
                </tr>
        `
            })

            html += `
            </tbody>
        </table>
      `
        })

        html += `
</body>
</html>
`

        return html
    }
}

// Predefined test cases dựa trên bảng kiểm thử
export const interfaceTestSuite: TestSuite = {
    name: 'Kiểm thử giao diện',
    testCases: [
        {
            id: 'S01',
            description: 'Màn hình Trang chủ hiển thị đầy đủ theo thiết kế, không sai chính tả',
            expectedResult: 'Đầy đủ, không sai chính tả',
            actualResult: 'Đầy đủ, không sai chính tả',
            status: 'Pass'
        },
        {
            id: 'S02',
            description: 'Màn hình giới thiệu hiển thị đầy đủ theo thiết kế, không sai chính tả',
            expectedResult: 'Đầy đủ, không sai chính tả',
            actualResult: 'Đầy đủ, Có lỗi chính tả ở ....',
            status: 'Fail'
        }
    ]
}

export const functionalTestSuite: TestSuite = {
    name: 'Kiểm thử chức năng',
    testCases: [
        {
            id: 'F01',
            description: 'Chức năng đăng xuất hoạt động đúng',
            expectedResult: 'Đăng xuất thành công, redirect về trang chủ',
            actualResult: 'Đăng xuất thành công, redirect về trang chủ',
            status: 'Pass'
        },
        {
            id: 'F02',
            description: 'Menu dropdown hiển thị đúng cho user đã đăng nhập',
            expectedResult: 'Hiển thị đầy đủ menu items',
            actualResult: 'Hiển thị đầy đủ menu items',
            status: 'Pass'
        },
        {
            id: 'F03',
            description: 'Responsive mobile menu hoạt động',
            expectedResult: 'Menu mobile toggle đúng',
            actualResult: 'Menu mobile toggle đúng',
            status: 'Pass'
        }
    ]
}