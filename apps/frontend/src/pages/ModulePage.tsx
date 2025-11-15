import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, BarChart, CheckCircle, Play } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { currentModule, loadModule, updateProgress, completeModule } = useUserStore();
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (moduleId) {
      loadModule(moduleId);
    }
  }, [moduleId]);

  if (!currentModule) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const sections = currentModule.content.sections;
  const progress = (completedSections.size / sections.length) * 100;

  const handleSectionComplete = () => {
    const section = sections[currentSection];
    setCompletedSections(prev => new Set(prev).add(section.id));

    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // All sections completed
      handleModuleComplete();
    }

    // Update progress
    updateProgress(currentModule.id, {
      completionPercentage: ((completedSections.size + 1) / sections.length) * 100,
      sectionsCompleted: Array.from(completedSections).concat(section.id),
      status: currentSection === sections.length - 1 ? 'completed' : 'in_progress'
    });
  };

  const handleModuleComplete = async () => {
    await completeModule(currentModule.id);
    navigate('/');
  };

  const currentSectionData = sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>

          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {currentModule.title}
          </h1>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{currentModule.estimatedMinutes} мин</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart className="w-4 h-4" />
              <span>{currentModule.difficulty}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>{completedSections.size}/{sections.length} секций</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="mb-4">
            <div className="text-sm text-purple-600 font-medium mb-1">
              Секция {currentSection + 1} из {sections.length}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentSectionData.title}
            </h2>
          </div>

          {/* Content blocks */}
          <div className="prose prose-sm max-w-none space-y-6">
            {currentSectionData.blocks.map((block: any, index: number) => (
              <div key={index}>
                {block.type === 'text' && (
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {block.content}
                  </ReactMarkdown>
                )}

                {block.type === 'code' && (
                  <div className="not-prose">
                    <div className="bg-gray-800 rounded-t-lg px-4 py-2 text-white text-sm flex items-center justify-between">
                      <span>{block.language}</span>
                      {block.runnable && (
                        <button className="flex items-center gap-1 text-green-400 hover:text-green-300">
                          <Play className="w-4 h-4" />
                          Запустить
                        </button>
                      )}
                    </div>
                    <SyntaxHighlighter
                      language={block.language}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0
                      }}
                    >
                      {block.code}
                    </SyntaxHighlighter>
                    {block.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-b-lg px-4 py-3 text-sm text-blue-800">
                        💡 {block.explanation}
                      </div>
                    )}
                  </div>
                )}

                {block.type === 'image' && (
                  <figure>
                    <img
                      src={block.url}
                      alt={block.alt}
                      className="rounded-lg w-full"
                    />
                    {block.caption && (
                      <figcaption className="text-center text-sm text-gray-500 mt-2">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Назад
            </button>

            <button
              onClick={handleSectionComplete}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
            >
              {currentSection === sections.length - 1
                ? 'Завершить модуль ✓'
                : 'Следующая секция →'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModulePage;
