/**
 * Test Runner và Report Generator
 * Chạy tests và tạo báo cáo tự động
 */

import { execSync } from 'child_process'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { TestReportGenerator, interfaceTestSuite, functionalTestSuite } from './reports/test-report-generator'

async function runTestsAndGenerateReport() {
    console.log('🚀 Bắt đầu chạy kiểm thử tự động...\n')

    try {
        // Tạo thư mục reports nếu chưa có
        if (!existsSync('test-reports')) {
            mkdirSync('test-reports', { recursive: true })
        }

        // Chạy Jest tests
        console.log('📋 Đang chạy Jest tests...')
        const jestOutput = execSync('npm test -- --verbose --json', {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe']
        })

        // Parse Jest results
        const jestResults = JSON.parse(jestOutput)
        console.log(`✅ Jest tests hoàn thành: ${jestResults.numPassedTests}/${jestResults.numTotalTests} passed\n`)

        // Tạo test report generator
        const reportGenerator = new TestReportGenerator()

        // Cập nhật kết quả dựa trên Jest results
        updateTestSuitesWithJestResults(jestResults)

        // Thêm test suites
        reportGenerator.addTestSuite(interfaceTestSuite)
        reportGenerator.addTestSuite(functionalTestSuite)

        // Tạo báo cáo Markdown
        const markdownReport = reportGenerator.generateMarkdownReport()
        writeFileSync('test-reports/test-report.md', markdownReport)
        console.log('📄 Đã tạo báo cáo Markdown: test-reports/test-report.md')

        // Tạo báo cáo HTML
        const htmlReport = reportGenerator.generateHTMLReport()
        writeFileSync('test-reports/test-report.html', htmlReport)
        console.log('🌐 Đã tạo báo cáo HTML: test-reports/test-report.html')

        // Tạo báo cáo JSON cho CI/CD
        const jsonReport = {
            timestamp: new Date().toISOString(),
            summary: {
                total: jestResults.numTotalTests,
                passed: jestResults.numPassedTests,
                failed: jestResults.numFailedTests,
                successRate: ((jestResults.numPassedTests / jestResults.numTotalTests) * 100).toFixed(2)
            },
            testSuites: [interfaceTestSuite, functionalTestSuite],
            jestResults: jestResults
        }
        writeFileSync('test-reports/test-report.json', JSON.stringify(jsonReport, null, 2))
        console.log('📊 Đã tạo báo cáo JSON: test-reports/test-report.json')

        console.log('\n🎉 Hoàn thành kiểm thử và tạo báo cáo!')
        console.log(`📈 Kết quả: ${jestResults.numPassedTests}/${jestResults.numTotalTests} tests passed (${((jestResults.numPassedTests / jestResults.numTotalTests) * 100).toFixed(1)}%)`)

    } catch (error: any) {
        console.error('❌ Lỗi khi chạy tests:', error.message)

        // Vẫn tạo báo cáo với thông tin lỗi
        const reportGenerator = new TestReportGenerator()

        // Đánh dấu tất cả tests là fail nếu có lỗi
        const failedInterfaceSuite = {
            ...interfaceTestSuite,
            testCases: interfaceTestSuite.testCases.map(tc => ({
                ...tc,
                status: 'Fail' as const,
                actualResult: `Lỗi: ${error.message}`
            }))
        }

        const failedFunctionalSuite = {
            ...functionalTestSuite,
            testCases: functionalTestSuite.testCases.map(tc => ({
                ...tc,
                status: 'Fail' as const,
                actualResult: `Lỗi: ${error.message}`
            }))
        }

        reportGenerator.addTestSuite(failedInterfaceSuite)
        reportGenerator.addTestSuite(failedFunctionalSuite)

        // Tạo báo cáo lỗi
        const errorReport = reportGenerator.generateMarkdownReport()
        writeFileSync('test-reports/error-report.md', errorReport)
        console.log('📄 Đã tạo báo cáo lỗi: test-reports/error-report.md')

        process.exit(1)
    }
}

function updateTestSuitesWithJestResults(jestResults: any) {
    // Cập nhật kết quả test cases dựa trên Jest results
    if (jestResults.testResults) {
        jestResults.testResults.forEach((testFile: any) => {
            if (testFile.assertionResults) {
                testFile.assertionResults.forEach((assertion: any) => {
                    // Map Jest test results to our test cases
                    const testName = assertion.title
                    const status = assertion.status === 'passed' ? 'Pass' : 'Fail'

                    // Cập nhật interface test suite
                    interfaceTestSuite.testCases.forEach(tc => {
                        if (testName.includes(tc.id) || testName.includes(tc.description)) {
                            tc.status = status
                            if (status === 'Fail' && assertion.failureMessages) {
                                tc.actualResult = assertion.failureMessages[0] || 'Test failed'
                            }
                        }
                    })

                    // Cập nhật functional test suite
                    functionalTestSuite.testCases.forEach(tc => {
                        if (testName.includes(tc.id) || testName.includes(tc.description)) {
                            tc.status = status
                            if (status === 'Fail' && assertion.failureMessages) {
                                tc.actualResult = assertion.failureMessages[0] || 'Test failed'
                            }
                        }
                    })
                })
            }
        })
    }
}

// Chạy nếu được gọi trực tiếp
if (require.main === module) {
    runTestsAndGenerateReport()
}

export { runTestsAndGenerateReport }